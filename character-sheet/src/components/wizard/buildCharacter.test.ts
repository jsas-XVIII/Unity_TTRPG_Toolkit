// buildCharacter.test.ts — unit tests for the wizard's character-assembly function.
//
// Focuses on the Priest class path feature: verifies that the selected path
// (Chaplain or War Priest) correctly overrides resource values on the built Character.

import { describe, it, expect } from 'vitest'
import { buildCharacter } from './buildCharacter'
import { INITIAL_DRAFT } from './WizardTypes'

// Minimal valid Priest draft. Override classPath per test.
function makePriestDraft(classPath: string | null) {
  return {
    ...INITIAL_DRAFT,
    name: 'Sera',
    age: '30',
    race: 'Human' as const,
    // Human base attributes are all 0; assign modifiers to fill the four slots
    attrAssignments: { might: 1, agility: 1, mind: 0, presence: -1 },
    className: 'Priest' as const,
    classPath,
    selectedPerkId: 'priest-perk-1',
    startingDenerim: 150 as const,
  }
}

describe('buildCharacter — Priest Chaplain path', () => {
  it('sets primary resource max to 10', () => {
    const char = buildCharacter(makePriestDraft('chaplain'))
    expect(char.primaryResource.max).toBe(10)
  })

  it('sets primary resource current to 10', () => {
    const char = buildCharacter(makePriestDraft('chaplain'))
    expect(char.primaryResource.current).toBe(10)
  })

  it('sets recharge die to 1d6', () => {
    const char = buildCharacter(makePriestDraft('chaplain'))
    expect(char.primaryResource.rechargeDie).toBe('1d6')
  })

  it('sets secondary resource (Healing Charges) max to 4', () => {
    const char = buildCharacter(makePriestDraft('chaplain'))
    expect(char.secondaryResource?.max).toBe(4)
  })

  it('names the primary resource Faith', () => {
    const char = buildCharacter(makePriestDraft('chaplain'))
    expect(char.primaryResource.name).toBe('Faith')
  })
})

describe('buildCharacter — Priest War Priest path', () => {
  it('sets primary resource max to 6', () => {
    const char = buildCharacter(makePriestDraft('warpriest'))
    expect(char.primaryResource.max).toBe(6)
  })

  it('sets primary resource current to 6', () => {
    const char = buildCharacter(makePriestDraft('warpriest'))
    expect(char.primaryResource.current).toBe(6)
  })

  it('sets recharge die to 1d4', () => {
    const char = buildCharacter(makePriestDraft('warpriest'))
    expect(char.primaryResource.rechargeDie).toBe('1d4')
  })

  it('sets secondary resource (Healing Charges) max to 3', () => {
    const char = buildCharacter(makePriestDraft('warpriest'))
    expect(char.secondaryResource?.max).toBe(3)
  })
})

describe('buildCharacter — Priest with no path selected', () => {
  it('falls back to the base class resource max', () => {
    const char = buildCharacter(makePriestDraft(null))
    // Base Priest primaryResourceMax is 8
    expect(char.primaryResource.max).toBe(8)
  })

  it('falls back to the base class recharge die', () => {
    const char = buildCharacter(makePriestDraft(null))
    expect(char.primaryResource.rechargeDie).toBe('1d6')
  })
})

describe('buildCharacter — classPath is persisted on the character', () => {
  it('stores the selected class path on the character', () => {
    expect(buildCharacter(makePriestDraft('chaplain')).classPath).toBe('chaplain')
    expect(buildCharacter(makePriestDraft('warpriest')).classPath).toBe('warpriest')
  })

  it('stores null when no class path was selected', () => {
    expect(buildCharacter(makePriestDraft(null)).classPath).toBeNull()
  })
})

describe('buildCharacter — non-Priest class is unaffected by classPath', () => {
  it('Dreadnought resource values are not changed by a stray classPath value', () => {
    const draft = {
      ...INITIAL_DRAFT,
      name: 'Bork',
      age: '25',
      race: 'Human' as const,
      attrAssignments: { might: 2, agility: 0, mind: 0, presence: -1 },
      className: 'Dreadnought' as const,
      classPath: 'chaplain', // irrelevant for Dreadnought
      selectedPerkId: 'dreadnought-perk-1',
      startingDenerim: 150 as const,
    }
    const char = buildCharacter(draft)
    // Dreadnought uses Fury, not Faith
    expect(char.primaryResource.name).toBe('Fury')
  })
})
