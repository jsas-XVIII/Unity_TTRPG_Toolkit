// importCharacter.test.ts — unit tests for the import check utility.
//
// checkImport reads a file and returns:
//   { status: 'new',       parsed } — id not in storage, safe to create
//   { status: 'duplicate', parsed } — id already exists, ask the user

import { describe, it, expect, vi } from 'vitest'
import { checkImport } from './importCharacter'
import type { CharacterRepository } from '../services/api'
import { baseCharacter } from '../test/fixtures'

function makeFile(character = baseCharacter): File {
  return new File([JSON.stringify(character)], 'character.json', {
    type: 'application/json',
  })
}

function mockApi(overrides?: Partial<CharacterRepository>): CharacterRepository {
  return {
    getAll: vi.fn(),
    getById: vi.fn().mockRejectedValue(new Error('Not found')),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('checkImport — new character (id not in storage)', () => {
  it('returns status "new" when the character id does not exist', async () => {
    const api = mockApi()
    const result = await checkImport(makeFile(), api)
    expect(result.status).toBe('new')
  })

  it('includes the parsed character data in the result', async () => {
    const api = mockApi()
    const result = await checkImport(makeFile(), api)
    expect(result.parsed.name).toBe(baseCharacter.name)
    expect(result.parsed.id).toBe(baseCharacter.id)
  })
})

describe('checkImport — existing character (id already in storage)', () => {
  it('returns status "duplicate" when the character id already exists', async () => {
    const api = mockApi({
      getById: vi.fn().mockResolvedValue(baseCharacter),
    })
    const result = await checkImport(makeFile(), api)
    expect(result.status).toBe('duplicate')
  })

  it('includes the parsed character data in the duplicate result', async () => {
    const api = mockApi({
      getById: vi.fn().mockResolvedValue(baseCharacter),
    })
    const result = await checkImport(makeFile(), api)
    expect(result.parsed.name).toBe(baseCharacter.name)
    expect(result.parsed.id).toBe(baseCharacter.id)
  })

  it('returns "new" on first import and "duplicate" on second', async () => {
    const api = mockApi({
      getById: vi
        .fn()
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(baseCharacter),
    })

    const first = await checkImport(makeFile(), api)
    const second = await checkImport(makeFile(), api)

    expect(first.status).toBe('new')
    expect(second.status).toBe('duplicate')
  })
})

describe('checkImport — error cases', () => {
  it('rejects when the file contains invalid JSON', async () => {
    const badFile = new File(['not valid json'], 'bad.json', { type: 'application/json' })
    await expect(checkImport(badFile, mockApi())).rejects.toThrow()
  })
})
