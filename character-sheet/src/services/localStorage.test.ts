// localStorage.test.ts — unit tests for the localStorage repository.
//
// Key behaviours verified:
//   1. create() preserves the id when one is supplied (import path)
//   2. create() generates a new UUID when no id is supplied (wizard path)
//   3. The character is persisted and retrievable
//   4. Importing the same file twice detects a duplicate (same id stored)
//   5. update() throws when the id doesn't exist

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { localStorageRepository as repo } from './localStorage'
import { baseCharacter } from '../test/fixtures'

// Wipe localStorage before each test so tests don't bleed into each other
beforeEach(() => {
  localStorage.clear()
})

describe('localStorageRepository.create()', () => {
  it('preserves the id when one is provided (import path)', async () => {
    const created = await repo.create(baseCharacter)
    expect(created.id).toBe(baseCharacter.id)
  })

  it('generates a new UUID when no id is provided (wizard path)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...withoutId } = baseCharacter
    const created = await repo.create(withoutId)
    expect(typeof created.id).toBe('string')
    expect(created.id.length).toBeGreaterThan(0)
  })

  it('persists the character so it can be retrieved by its id', async () => {
    const created = await repo.create(baseCharacter)
    const fetched = await repo.getById(created.id)

    expect(fetched.name).toBe(baseCharacter.name)
    expect(fetched.className).toBe(baseCharacter.className)
    expect(fetched.race).toBe(baseCharacter.race)
  })

  it('preserves all character fields', async () => {
    const created = await repo.create(baseCharacter)

    expect(created.name).toBe(baseCharacter.name)
    expect(created.level).toBe(baseCharacter.level)
    expect(created.attributes).toEqual(baseCharacter.attributes)
    expect(created.primaryResource).toEqual(baseCharacter.primaryResource)
    expect(created.secondaryResource).toBeNull()
  })

  it('getById finds the character after creation, enabling duplicate detection', async () => {
    await repo.create(baseCharacter)
    // checkImport calls getById to detect duplicates before calling create again
    const found = await repo.getById(baseCharacter.id)
    expect(found.id).toBe(baseCharacter.id)
  })
})

describe('localStorageRepository.getById()', () => {
  it('throws if the id does not exist', async () => {
    await expect(repo.getById('non-existent-id')).rejects.toThrow()
  })
})

describe('localStorageRepository — character migration on load', () => {
  it('adds hpBonus: 0 to characters loaded without that field', async () => {
    // Simulate a character saved before hpBonus was added
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hpBonus, ...withoutHpBonus } = baseCharacter
    localStorage.setItem('unity_ttrpg_characters', JSON.stringify([withoutHpBonus]))
    const fetched = await repo.getById(baseCharacter.id)
    expect(fetched.hpBonus).toBe(0)
  })

  it('preserves existing hpBonus when loading a current-format character', async () => {
    const char = { ...baseCharacter, hpBonus: 12 }
    localStorage.setItem('unity_ttrpg_characters', JSON.stringify([char]))
    const fetched = await repo.getById(baseCharacter.id)
    expect(fetched.hpBonus).toBe(12)
  })
})

describe('localStorageRepository — QuotaExceededError propagation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('create() rejects when setItem throws QuotaExceededError', async () => {
    const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw quotaError
    })
    await expect(repo.create(baseCharacter)).rejects.toThrow()
  })
})

describe('localStorageRepository.update()', () => {
  it('throws when the character has not been created first', async () => {
    await expect(repo.update(baseCharacter.id, { name: 'Should Not Work' })).rejects.toThrow()
  })

  it('merges patch fields onto an existing record without affecting other fields', async () => {
    const created = await repo.create(baseCharacter)
    const updated = await repo.update(created.id, { name: 'Renamed', level: 5 })

    expect(updated.name).toBe('Renamed')
    expect(updated.level).toBe(5)
    // Fields not in the patch should be unchanged
    expect(updated.className).toBe(baseCharacter.className)
    expect(updated.attributes).toEqual(baseCharacter.attributes)
  })
})
