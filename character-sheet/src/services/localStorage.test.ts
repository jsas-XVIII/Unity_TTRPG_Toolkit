// localStorage.test.ts — unit tests for the localStorage repository.
//
// Key behaviours verified:
//   1. create() preserves the id when one is supplied (import path)
//   2. create() generates a new UUID when no id is supplied (wizard path)
//   3. The character is persisted and retrievable
//   4. Importing the same file twice detects a duplicate (same id stored)
//   5. update() throws when the id doesn't exist

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { localStorageRepository as repo, invalidateCharacterCache } from './localStorage'
import { baseCharacter } from '../test/fixtures'

// Wipe localStorage and module cache before each test so tests don't bleed into each other
beforeEach(() => {
  localStorage.clear()
  invalidateCharacterCache()
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

// Corrupt-storage resilience: verifies backup-and-recover behaviour added to loadAll().
// [JSas | 2026-05-25] Added: covers non-JSON, non-array, bad-record, null, and write-once backup cases
describe('localStorageRepository — corrupt storage resilience', () => {
  const STORAGE_KEY = 'unity_ttrpg_characters'
  const BACKUP_KEY = `${STORAGE_KEY}__backup`

  it('returns [] and writes backup when blob is non-JSON', async () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json}}}')
    const all = await repo.getAll()
    expect(all).toHaveLength(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBe('not-valid-json}}}')
  })

  it('returns [] and writes backup when blob is valid JSON but not an array', async () => {
    const blob = JSON.stringify({ not: 'an array' })
    localStorage.setItem(STORAGE_KEY, blob)
    const all = await repo.getAll()
    expect(all).toHaveLength(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBe(blob)
  })

  it('valid records survive when one record fails migration; backup written', async () => {
    const blob = JSON.stringify([baseCharacter, { id: 'bad', powers: 'not-an-array' }])
    localStorage.setItem(STORAGE_KEY, blob)
    const all = await repo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe(baseCharacter.id)
    expect(localStorage.getItem(BACKUP_KEY)).toBe(blob)
  })

  it('returns [] with no backup when storage is null (first run)', async () => {
    // localStorage is clear from beforeEach
    const all = await repo.getAll()
    expect(all).toHaveLength(0)
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull()
  })

  it('backup is write-once — second corrupt load does not overwrite the first backup', async () => {
    localStorage.setItem(STORAGE_KEY, 'first-corrupt')
    await repo.getAll()
    invalidateCharacterCache()
    localStorage.setItem(STORAGE_KEY, 'second-corrupt')
    await repo.getAll()
    expect(localStorage.getItem(BACKUP_KEY)).toBe('first-corrupt')
  })
})

describe('localStorageRepository — cross-tab cache invalidation', () => {
  it('reflects changes written directly to localStorage (simulating another tab)', async () => {
    await repo.create(baseCharacter)

    // Simulate another tab writing a modified roster directly to localStorage
    const modified = { ...baseCharacter, name: 'Changed by Tab B' }
    localStorage.setItem('unity_ttrpg_characters', JSON.stringify([modified]))

    // Dispatch the storage event that browsers fire in all tabs except the writer
    window.dispatchEvent(new StorageEvent('storage', { key: 'unity_ttrpg_characters' }))

    // Cache should be invalidated — next read re-parses from localStorage
    const fetched = await repo.getById(baseCharacter.id)
    expect(fetched.name).toBe('Changed by Tab B')
  })

  it('invalidates cache when another tab calls localStorage.clear() (key is null)', async () => {
    await repo.create(baseCharacter)

    // Simulate another tab calling localStorage.clear() — key is null per the Web Storage spec
    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: null }))

    // Cache should be invalidated — roster is now empty
    const all = await repo.getAll()
    expect(all).toHaveLength(0)
  })
})
