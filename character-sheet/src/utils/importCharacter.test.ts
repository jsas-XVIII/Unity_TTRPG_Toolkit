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

describe('checkImport — power format migration', () => {
  // Old format: powers stored full Power objects with nested upgrades[]
  const oldFormatCharacter = {
    ...baseCharacter,
    powers: [
      {
        id: 'power-abc',
        name: 'Shield Slam',
        tier: 1,
        actionType: 'Standard',
        cost: '1',
        target: 'Single',
        range: 'Adjacent',
        effectsText: 'Deal damage.',
        upgrades: [
          { id: 'upg-1', name: 'Heavy Blow', description: 'Extra damage.', purchased: false },
          { id: 'upg-2', name: 'Stagger', description: 'Slow the target.', purchased: true },
        ],
      },
    ],
  }

  // New format: powers stored as { id, purchasedUpgradeIds }
  const newFormatCharacter = {
    ...baseCharacter,
    powers: [{ id: 'power-abc', purchasedUpgradeIds: ['upg-2'] }],
  }

  it('migrates old-format powers to CharacterPower on import', async () => {
    const file = new File([JSON.stringify(oldFormatCharacter)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.parsed.powers).toEqual([{ id: 'power-abc', purchasedUpgradeIds: ['upg-2'] }])
  })

  it('preserves purchased upgrade IDs from old-format saves', async () => {
    const file = new File([JSON.stringify(oldFormatCharacter)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    const power = result.parsed.powers[0]
    expect(power.purchasedUpgradeIds).toContain('upg-2')
    expect(power.purchasedUpgradeIds).not.toContain('upg-1')
  })

  it('does not include unpurchased upgrades in purchasedUpgradeIds', async () => {
    const file = new File([JSON.stringify(oldFormatCharacter)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.parsed.powers[0].purchasedUpgradeIds).toHaveLength(1)
  })

  it('passes new-format powers through unchanged', async () => {
    const file = new File([JSON.stringify(newFormatCharacter)], 'new.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.parsed.powers).toEqual([{ id: 'power-abc', purchasedUpgradeIds: ['upg-2'] }])
  })

  it('handles a power with no upgrades in old format', async () => {
    const character = {
      ...baseCharacter,
      powers: [
        {
          id: 'power-xyz',
          name: 'Charge',
          tier: 1,
          actionType: 'Standard',
          cost: '1',
          target: 'Single',
          range: 'Nearby',
          effectsText: 'Rush forward.',
          upgrades: [],
        },
      ],
    }
    const file = new File([JSON.stringify(character)], 'no-upgrades.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.parsed.powers).toEqual([{ id: 'power-xyz', purchasedUpgradeIds: [] }])
  })
})
