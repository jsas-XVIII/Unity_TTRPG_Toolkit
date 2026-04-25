import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImportFlow } from './useImportFlow'
import { checkImport } from '../utils/importCharacter'
import type { CharacterRepository } from '../services/api'
import { baseCharacter } from '../test/fixtures'

vi.mock('../utils/importCharacter', () => ({
  checkImport: vi.fn(),
}))

const mockCheckImport = checkImport as ReturnType<typeof vi.fn>

const createdCharacter = { ...baseCharacter, id: 'created-id', name: 'Created' }
const copyCharacter = { ...baseCharacter, id: 'copy-id', name: `${baseCharacter.name} - copy` }

function mockApi(overrides: Partial<CharacterRepository> = {}): CharacterRepository {
  return {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue(createdCharacter),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function makeFile(): File {
  return new File([JSON.stringify(baseCharacter)], 'char.json', { type: 'application/json' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

// --- handleImportDirect (fromHome=true) ---

describe('handleImportDirect — new character', () => {
  it('calls api.create and then onLoadCharacter', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const api = mockApi()
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(api, onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImportDirect(makeFile()))

    expect(api.create).toHaveBeenCalledWith(baseCharacter)
    expect(onLoadCharacter).toHaveBeenCalledWith(createdCharacter)
  })

  it('does not set importedCharacter (navigates directly)', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const { result } = renderHook(() => useImportFlow(mockApi(), vi.fn(), vi.fn()))

    await act(() => result.current.handleImportDirect(makeFile()))

    expect(result.current.importedCharacter).toBeNull()
  })
})

// --- handleImport (fromHome=false) ---

describe('handleImport — new character', () => {
  it('calls api.create and sets importedCharacter', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const api = mockApi()
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(api, onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImport(makeFile()))

    expect(api.create).toHaveBeenCalledWith(baseCharacter)
    expect(result.current.importedCharacter).toEqual(createdCharacter)
  })

  it('does not call onLoadCharacter — waits for user confirmation', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(mockApi(), onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImport(makeFile()))

    expect(onLoadCharacter).not.toHaveBeenCalled()
  })
})

// --- duplicate detection ---

describe('handleImport / handleImportDirect — duplicate ID', () => {
  it('sets duplicateImport and does not call api.create', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const api = mockApi()
    const { result } = renderHook(() => useImportFlow(api, vi.fn(), vi.fn()))

    await act(() => result.current.handleImport(makeFile()))

    expect(api.create).not.toHaveBeenCalled()
    expect(result.current.duplicateImport?.parsed).toEqual(baseCharacter)
  })

  it('preserves fromHome=true in duplicateImport when triggered from home', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const { result } = renderHook(() => useImportFlow(mockApi(), vi.fn(), vi.fn()))

    await act(() => result.current.handleImportDirect(makeFile()))

    expect(result.current.duplicateImport?.fromHome).toBe(true)
  })

  it('preserves fromHome=false in duplicateImport when triggered from sheet', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const { result } = renderHook(() => useImportFlow(mockApi(), vi.fn(), vi.fn()))

    await act(() => result.current.handleImport(makeFile()))

    expect(result.current.duplicateImport?.fromHome).toBe(false)
  })
})

// --- handleDuplicateConfirm ---

describe('handleDuplicateConfirm', () => {
  it('creates a copy with " - copy" appended and calls onLoadCharacter (fromHome=true)', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const api = mockApi({ create: vi.fn().mockResolvedValue(copyCharacter) })
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(api, onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImportDirect(makeFile()))
    await act(() => result.current.handleDuplicateConfirm())

    const createArg = (api.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(createArg.name).toBe(`${baseCharacter.name} - copy`)
    expect(createArg.id).toBeUndefined()
    expect(onLoadCharacter).toHaveBeenCalledWith(copyCharacter)
  })

  it('sets importedCharacter instead of navigating when fromHome=false', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const api = mockApi({ create: vi.fn().mockResolvedValue(copyCharacter) })
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(api, onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImport(makeFile()))
    await act(() => result.current.handleDuplicateConfirm())

    expect(onLoadCharacter).not.toHaveBeenCalled()
    expect(result.current.importedCharacter).toEqual(copyCharacter)
  })

  it('clears duplicateImport after confirming', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const { result } = renderHook(() => useImportFlow(mockApi(), vi.fn(), vi.fn()))

    await act(() => result.current.handleImport(makeFile()))
    await act(() => result.current.handleDuplicateConfirm())

    expect(result.current.duplicateImport).toBeNull()
  })
})

// --- handleDuplicateDismiss ---

describe('handleDuplicateDismiss', () => {
  it('clears duplicateImport without creating anything', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const api = mockApi()
    const { result } = renderHook(() => useImportFlow(api, vi.fn(), vi.fn()))

    await act(() => result.current.handleImport(makeFile()))
    act(() => result.current.handleDuplicateDismiss())

    expect(result.current.duplicateImport).toBeNull()
    expect(api.create).not.toHaveBeenCalled()
  })
})

// --- handleImportConfirm / handleImportDismiss ---

describe('handleImportConfirm', () => {
  it('calls onLoadCharacter with the pending importedCharacter and clears it', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(mockApi(), onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImport(makeFile()))
    act(() => result.current.handleImportConfirm())

    expect(onLoadCharacter).toHaveBeenCalledWith(createdCharacter)
    expect(result.current.importedCharacter).toBeNull()
  })
})

describe('handleImportDismiss', () => {
  it('clears importedCharacter without calling onLoadCharacter', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })
    const onLoadCharacter = vi.fn()
    const { result } = renderHook(() => useImportFlow(mockApi(), onLoadCharacter, vi.fn()))

    await act(() => result.current.handleImport(makeFile()))
    act(() => result.current.handleImportDismiss())

    expect(result.current.importedCharacter).toBeNull()
    expect(onLoadCharacter).not.toHaveBeenCalled()
  })
})

// --- error handling ---

describe('error handling', () => {
  it('calls onError when checkImport throws', async () => {
    mockCheckImport.mockRejectedValue(new Error('bad file'))
    const onError = vi.fn()
    const { result } = renderHook(() => useImportFlow(mockApi(), vi.fn(), onError))

    await act(() => result.current.handleImport(makeFile()))

    expect(onError).toHaveBeenCalledOnce()
  })

  it('calls onError when api.create throws during duplicate confirm', async () => {
    mockCheckImport.mockResolvedValue({ status: 'duplicate', parsed: baseCharacter })
    const api = mockApi({ create: vi.fn().mockRejectedValue(new Error('storage full')) })
    const onError = vi.fn()
    const { result } = renderHook(() => useImportFlow(api, vi.fn(), onError))

    await act(() => result.current.handleImport(makeFile()))
    await act(() => result.current.handleDuplicateConfirm())

    expect(onError).toHaveBeenCalledOnce()
  })
})
