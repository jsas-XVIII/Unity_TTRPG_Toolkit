import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import App from './App'
import { baseCharacter } from './test/fixtures'
import type { CharacterRepository } from './services/api'

vi.mock('./hooks/useApi')
vi.mock('./utils/importCharacter', () => ({
  checkImport: vi.fn(),
  migrateCharacter: vi.fn((c) => c),
}))

const { useApi } = await import('./hooks/useApi')
const { checkImport } = await import('./utils/importCharacter')
const mockUseApi = vi.mocked(useApi)
const mockCheckImport = vi.mocked(checkImport)

function mockApi(overrides: Partial<CharacterRepository> = {}): CharacterRepository {
  return {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockRejectedValue(new Error('Not found')),
    create: vi.fn().mockResolvedValue(baseCharacter),
    update: vi.fn().mockResolvedValue(baseCharacter),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  mockUseApi.mockReturnValue(mockApi())
})

describe('App — error banner visible from home view (#4)', () => {
  it('shows error banner when import fails from the HomeScreen', async () => {
    const api = mockApi({ create: vi.fn().mockRejectedValue(new Error('Storage error')) })
    mockUseApi.mockReturnValue(api)
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })

    render(<App />)

    const file = new File([JSON.stringify(baseCharacter)], 'char.json', {
      type: 'application/json',
    })
    const input = screen.getByTestId('character-import-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText(/save failed/i)).toBeInTheDocument())
  })

  it('does not show error banner when import succeeds', async () => {
    mockCheckImport.mockResolvedValue({ status: 'new', parsed: baseCharacter })

    render(<App />)

    const file = new File([JSON.stringify(baseCharacter)], 'char.json', {
      type: 'application/json',
    })
    const input = screen.getByTestId('character-import-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.queryByText(/save failed/i)).not.toBeInTheDocument())
  })
})

describe('App — handleSave does not fall back to create on update rejection (#9)', () => {
  it('does not call api.create when api.update rejects', async () => {
    const api = mockApi({
      getAll: vi.fn().mockResolvedValue([baseCharacter]),
      getById: vi.fn().mockResolvedValue(baseCharacter),
      update: vi.fn().mockRejectedValue(new Error('Storage error')),
      create: vi.fn().mockResolvedValue(baseCharacter),
    })
    mockUseApi.mockReturnValue(api)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /existing character/i }))
    await waitFor(() => screen.getByText(baseCharacter.name))
    fireEvent.click(screen.getByText(baseCharacter.name))
    await waitFor(() => screen.getByRole('button', { name: /^save$/i }))

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(api.update).toHaveBeenCalled())

    expect(api.create).not.toHaveBeenCalled()
  })
})

describe('App — save timer cancellation on new save (#14)', () => {
  it('calls clearTimeout when a second save is triggered before the first timer expires', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')

    const api = mockApi({
      getAll: vi.fn().mockResolvedValue([baseCharacter]),
      getById: vi.fn().mockResolvedValue(baseCharacter),
      update: vi.fn().mockResolvedValue(baseCharacter),
    })
    mockUseApi.mockReturnValue(api)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /existing character/i }))
    await waitFor(() => screen.getByText(baseCharacter.name))
    fireEvent.click(screen.getByText(baseCharacter.name))
    await waitFor(() => screen.getByRole('button', { name: /^save$/i }))

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(1))

    const callsBefore = clearTimeoutSpy.mock.calls.length

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))
    await waitFor(() => expect(api.update).toHaveBeenCalledTimes(2))

    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBefore)
  })
})
