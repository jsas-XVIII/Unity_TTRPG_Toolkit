// localStorage.test.ts — unit tests for the localStorage repository.
//
// These tests focus on the create() method because that is what handleImport
// calls when a JSON file is imported. The key behaviours being verified:
//   1. create() always assigns a fresh UUID (ignores any id on the input)
//   2. The character is persisted and retrievable
//   3. Importing the same file twice creates two independent copies
//   4. update() throws when the id doesn't exist (enforces the create path for imports)

import { describe, it, expect, beforeEach } from 'vitest'
import { localStorageRepository as repo } from './localStorage'
import { baseCharacter } from '../test/fixtures'

// Wipe localStorage before each test so tests don't bleed into each other
beforeEach(() => {
  localStorage.clear()
})

describe('localStorageRepository.create()', () => {
  it('assigns a new UUID, ignoring the id on the input', async () => {
    const created = await repo.create(baseCharacter)

    // The repository must never re-use the id from the imported file
    expect(created.id).not.toBe(baseCharacter.id)
    // The id should be a non-empty string (uuid format check is covered by uuid library)
    expect(typeof created.id).toBe('string')
    expect(created.id.length).toBeGreaterThan(0)
  })

  it('persists the character so it can be retrieved by its new id', async () => {
    const created = await repo.create(baseCharacter)
    const fetched = await repo.getById(created.id)

    expect(fetched.name).toBe(baseCharacter.name)
    expect(fetched.className).toBe(baseCharacter.className)
    expect(fetched.race).toBe(baseCharacter.race)
  })

  it('importing the same file twice creates two independent copies with different UUIDs', async () => {
    const first = await repo.create(baseCharacter)
    const second = await repo.create(baseCharacter)

    // Each import must produce a unique record — no silent overwrites
    expect(first.id).not.toBe(second.id)

    // Both records should exist in storage
    const all = await repo.getAll()
    expect(all).toHaveLength(2)
  })

  it('preserves all character fields apart from id', async () => {
    const created = await repo.create(baseCharacter)

    expect(created.name).toBe(baseCharacter.name)
    expect(created.level).toBe(baseCharacter.level)
    expect(created.attributes).toEqual(baseCharacter.attributes)
    expect(created.primaryResource).toEqual(baseCharacter.primaryResource)
    expect(created.secondaryResource).toBeNull()
  })
})

describe('localStorageRepository.getById()', () => {
  it('throws if the id does not exist — update() would fail the same way', async () => {
    // This is why handleImport uses create() rather than update():
    // an imported character's original id may not exist in this browser's storage
    await expect(repo.getById('non-existent-id')).rejects.toThrow()
  })
})

describe('localStorageRepository.update()', () => {
  it('throws when the character has not been created first', async () => {
    // Confirms that importing a file with an unknown id cannot silently
    // overwrite or corrupt storage — it would just throw and show the error toast
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
