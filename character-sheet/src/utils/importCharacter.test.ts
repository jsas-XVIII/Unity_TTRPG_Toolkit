// importCharacter.test.ts — unit tests for the import check utility.
//
// checkImport reads a file and returns:
//   { status: 'new',       parsed } — id not in storage, safe to create
//   { status: 'duplicate', parsed } — id already exists, ask the user

import { describe, it, expect, vi } from 'vitest'
import { checkImport, migrateCharacter, type ImportCheckResult } from './importCharacter'
import type { CharacterRepository } from '../services/api'
import { baseCharacter } from '../test/fixtures'

function assertParsed(
  result: ImportCheckResult
): asserts result is Exclude<ImportCheckResult, { status: 'invalid' }> {
  if (result.status === 'invalid') throw new Error('Expected a parsed result')
}

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
    assertParsed(result)
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
    assertParsed(result)
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

describe('checkImport — invalid file cases', () => {
  it('returns status "invalid" when the file contains malformed JSON', async () => {
    const badFile = new File(['not valid json'], 'bad.json', { type: 'application/json' })
    const result = await checkImport(badFile, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when the JSON is not a character (e.g. a content pack)', async () => {
    const contentPack = JSON.stringify({ powers: [], perks: [] })
    const file = new File([contentPack], 'unity-content-pack.json', { type: 'application/json' })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when the JSON has no id field', async () => {
    const noId = JSON.stringify({ name: 'Aldric', className: 'Dreadnought' })
    const file = new File([noId], 'partial.json', { type: 'application/json' })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when className is not a recognized value', async () => {
    const file = makeFile({ ...baseCharacter, className: 'Wizard' as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when race is not a recognized value', async () => {
    const file = makeFile({ ...baseCharacter, race: 'Elf' as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when level is not a number', async () => {
    const file = makeFile({ ...baseCharacter, level: '1' as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when powers is not an array', async () => {
    const file = makeFile({ ...baseCharacter, powers: null as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns status "invalid" when the JSON is an array', async () => {
    const file = new File([JSON.stringify([baseCharacter])], 'array.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })
})

// Nested-field validation: verifies isValidCharacter rejects malformed attributes and resources.
// [JSas | 2026-05-25] Added: exercises the new Number.isFinite / string checks on attribute and resource fields
describe('checkImport — nested field validation', () => {
  it('returns "invalid" when attributes is an empty object (missing fields)', async () => {
    const file = makeFile({ ...baseCharacter, attributes: {} as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when an attribute value is NaN', async () => {
    const file = makeFile({
      ...baseCharacter,
      attributes: { might: NaN, agility: 1, mind: 1, presence: 1 },
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when primaryResource is an empty object (missing fields)', async () => {
    const file = makeFile({ ...baseCharacter, primaryResource: {} as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when primaryResource.current is NaN', async () => {
    const file = makeFile({
      ...baseCharacter,
      primaryResource: { name: 'Fury', current: NaN, max: 6, rechargeDie: '1d4' },
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when secondaryResource is present but malformed', async () => {
    const file = makeFile({
      ...baseCharacter,
      secondaryResource: { name: 'Focus', current: 'bad' as never, max: 4 },
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('accepts null secondaryResource as valid', async () => {
    const file = makeFile({ ...baseCharacter, secondaryResource: null })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('new')
  })
})

describe('checkImport — unknown key sanitization', () => {
  it('strips unknown keys from the parsed character', async () => {
    const withExtra = { ...baseCharacter, unknownField: 'should be removed' }
    const file = new File([JSON.stringify(withExtra)], 'extra.json', { type: 'application/json' })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('new')
    if (result.status === 'new') {
      expect(result.parsed).not.toHaveProperty('unknownField')
    }
  })

  it('preserves optional fields that are set (classPath, featureUpgrades, usedPowerIds)', async () => {
    const withOptionals = {
      ...baseCharacter,
      classPath: 'chaplain',
      featureUpgrades: { 'power-1': ['upg-a'] },
      usedPowerIds: ['power-x'],
    }
    const file = new File([JSON.stringify(withOptionals)], 'optionals.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('new')
    if (result.status === 'new') {
      expect(result.parsed.classPath).toBe('chaplain')
      expect(result.parsed.featureUpgrades).toEqual({ 'power-1': ['upg-a'] })
      expect(result.parsed.usedPowerIds).toEqual(['power-x'])
    }
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
    assertParsed(result)
    expect(result.parsed.powers).toEqual([{ id: 'power-abc', purchasedUpgradeIds: ['upg-2'] }])
  })

  it('preserves purchased upgrade IDs from old-format saves', async () => {
    const file = new File([JSON.stringify(oldFormatCharacter)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    assertParsed(result)
    const power = result.parsed.powers[0]
    expect(power.purchasedUpgradeIds).toContain('upg-2')
    expect(power.purchasedUpgradeIds).not.toContain('upg-1')
  })

  it('does not include unpurchased upgrades in purchasedUpgradeIds', async () => {
    const file = new File([JSON.stringify(oldFormatCharacter)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    assertParsed(result)
    expect(result.parsed.powers[0].purchasedUpgradeIds).toHaveLength(1)
  })

  it('passes new-format powers through unchanged', async () => {
    const file = new File([JSON.stringify(newFormatCharacter)], 'new.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    assertParsed(result)
    expect(result.parsed.powers).toEqual([{ id: 'power-abc', purchasedUpgradeIds: ['upg-2'] }])
  })

  it('adds hpBonus: 0 to characters that do not have it (via checkImport)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hpBonus, ...withoutHpBonus } = baseCharacter
    const file = new File([JSON.stringify(withoutHpBonus)], 'old.json', {
      type: 'application/json',
    })
    const result = await checkImport(file, mockApi())
    assertParsed(result)
    expect(result.parsed.hpBonus).toBe(0)
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
    assertParsed(result)
    expect(result.parsed.powers).toEqual([{ id: 'power-xyz', purchasedUpgradeIds: [] }])
  })
})

describe('checkImport — array element validation (#2)', () => {
  it('returns "invalid" when armor contains null', async () => {
    const file = makeFile({ ...baseCharacter, armor: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when armor element is missing av (empty object)', async () => {
    const file = makeFile({ ...baseCharacter, armor: [{}] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when powers element is null', async () => {
    const file = makeFile({ ...baseCharacter, powers: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when powers element has purchasedUpgradeIds: null', async () => {
    const file = makeFile({
      ...baseCharacter,
      powers: [{ id: 'power-x', purchasedUpgradeIds: null }] as never,
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when perks contains null', async () => {
    const file = makeFile({ ...baseCharacter, perks: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when weapons contains null', async () => {
    const file = makeFile({ ...baseCharacter, weapons: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when corePaths contains null', async () => {
    const file = makeFile({ ...baseCharacter, corePaths: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('returns "invalid" when equippedArtifacts contains null', async () => {
    const file = makeFile({ ...baseCharacter, equippedArtifacts: [null] as never })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('invalid')
  })

  it('accepts a valid armor element with an av number', async () => {
    const file = makeFile({
      ...baseCharacter,
      armor: [{ id: 'armor-1', name: 'Leather', av: 2, penalty: 0 }] as never,
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('new')
  })

  it('accepts new-format powers element with purchasedUpgradeIds array', async () => {
    const file = makeFile({
      ...baseCharacter,
      powers: [{ id: 'power-x', purchasedUpgradeIds: [] }],
    })
    const result = await checkImport(file, mockApi())
    expect(result.status).toBe('new')
  })
})

describe('migrateCharacter — hpBonus field', () => {
  it('adds hpBonus: 0 when the field is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hpBonus, ...withoutHpBonus } = baseCharacter
    const result = migrateCharacter(withoutHpBonus as typeof baseCharacter)
    expect(result.hpBonus).toBe(0)
  })

  it('preserves an existing hpBonus value', () => {
    const char = { ...baseCharacter, hpBonus: 15 }
    expect(migrateCharacter(char).hpBonus).toBe(15)
  })

  it('leaves hpBonus: 0 unchanged', () => {
    expect(migrateCharacter(baseCharacter).hpBonus).toBe(0)
  })
})
