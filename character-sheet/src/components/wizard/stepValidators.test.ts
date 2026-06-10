// stepValidators.test.ts — unit tests for wizard step validation logic.
//
// Covers all validators with non-trivial logic: validateStepName, validateStepRace,
// validateStepAttributes, validateStepClass, validateStepCorePaths, and validateStepPerk.
// Powers and Equipment validators always return null and are intentionally untested.

import { describe, it, expect } from 'vitest'
import {
  validateStepName,
  validateStepRace,
  validateStepAttributes,
  validateStepClass,
  validateStepCorePaths,
  validateStepPerk,
} from './stepValidators'
import { INITIAL_DRAFT } from './WizardTypes'

const baseDraft = {
  ...INITIAL_DRAFT,
  name: 'Test',
  race: 'Human' as const,
  attrAssignments: { might: 1, agility: 1, mind: 0, presence: -1 },
}

describe('validateStepPerk — class without paths (e.g. Dreadnought)', () => {
  it('returns an error when no perk is selected', () => {
    const draft = { ...baseDraft, className: 'Dreadnought' as const, selectedPerkId: null }
    expect(validateStepPerk(draft)).toBe('Please choose a Class Perk.')
  })

  it('returns null when a perk is selected', () => {
    const draft = {
      ...baseDraft,
      className: 'Dreadnought' as const,
      selectedPerkId: 'dreadnought-perk-1',
    }
    expect(validateStepPerk(draft)).toBeNull()
  })
})

describe('validateStepPerk — Priest (class with paths)', () => {
  it('returns a class path error when no path is selected', () => {
    const draft = {
      ...baseDraft,
      className: 'Priest' as const,
      classPath: null,
      selectedPerkId: 'priest-perk-1',
    }
    expect(validateStepPerk(draft)).toBe('Please choose a Class Path.')
  })

  it('returns a perk error when a path is chosen but no perk', () => {
    const draft = {
      ...baseDraft,
      className: 'Priest' as const,
      classPath: 'chaplain',
      selectedPerkId: null,
    }
    expect(validateStepPerk(draft)).toBe('Please choose a Class Perk.')
  })

  it('returns null when both path and perk are selected', () => {
    const draft = {
      ...baseDraft,
      className: 'Priest' as const,
      classPath: 'warpriest',
      selectedPerkId: 'priest-perk-2',
    }
    expect(validateStepPerk(draft)).toBeNull()
  })

  it('prioritises the class path error over the missing perk error', () => {
    const draft = {
      ...baseDraft,
      className: 'Priest' as const,
      classPath: null,
      selectedPerkId: null,
    }
    expect(validateStepPerk(draft)).toBe('Please choose a Class Path.')
  })
})

// ---------------------------------------------------------------------------
// validateStepName
// ---------------------------------------------------------------------------
describe('validateStepName', () => {
  it('returns an error when name is empty', () => {
    expect(validateStepName({ ...baseDraft, name: '' })).toBe('Character name is required.')
  })

  it('returns an error when name is whitespace only', () => {
    expect(validateStepName({ ...baseDraft, name: '   ' })).toBe('Character name is required.')
  })

  it('returns null when name has visible characters', () => {
    expect(validateStepName({ ...baseDraft, name: 'Aldric' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// validateStepRace
// ---------------------------------------------------------------------------
describe('validateStepRace', () => {
  it('returns an error when no race is selected', () => {
    expect(validateStepRace({ ...baseDraft, race: null })).toBe('Please select a race.')
  })

  it('returns null when a race is selected', () => {
    expect(validateStepRace({ ...baseDraft, race: 'Human' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// validateStepAttributes
// ---------------------------------------------------------------------------
describe('validateStepAttributes', () => {
  it('returns an error when at least one attribute is unassigned', () => {
    const draft = {
      ...baseDraft,
      attrAssignments: { might: 1, agility: 1, mind: 0, presence: null },
    }
    expect(validateStepAttributes(draft)).toBe('Assign a modifier to every attribute.')
  })

  it('returns an error when all attributes are unassigned', () => {
    const draft = {
      ...baseDraft,
      attrAssignments: { might: null, agility: null, mind: null, presence: null },
    }
    expect(validateStepAttributes(draft)).toBe('Assign a modifier to every attribute.')
  })

  it('returns null when all four attributes are assigned', () => {
    const draft = {
      ...baseDraft,
      attrAssignments: { might: 1, agility: 1, mind: 0, presence: -1 },
    }
    expect(validateStepAttributes(draft)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// validateStepClass
// ---------------------------------------------------------------------------
describe('validateStepClass', () => {
  it('returns an error when no class is selected', () => {
    expect(validateStepClass({ ...baseDraft, className: null })).toBe('Please select a class.')
  })

  it('returns null when a class is selected', () => {
    expect(validateStepClass({ ...baseDraft, className: 'Dreadnought' })).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// validateStepCorePaths
// ---------------------------------------------------------------------------
describe('validateStepCorePaths', () => {
  const validPaths = [
    { id: 'cp-1', name: 'Combat', description: '', points: 2 },
    { id: 'cp-2', name: 'Survival', description: '', points: 2 },
    { id: 'cp-3', name: 'Lore', description: '', points: 1 },
  ]

  it('returns an error when fewer than 3 paths are set', () => {
    const draft = {
      ...baseDraft,
      corePaths: [{ id: 'cp-1', name: 'Combat', description: '', points: 3 }],
    }
    expect(validateStepCorePaths(draft)).toBe('You must have exactly 3 Core Paths.')
  })

  it('returns an error when more than 3 paths are set', () => {
    const draft = {
      ...baseDraft,
      corePaths: [
        { id: 'cp-1', name: 'A', description: '', points: 1 },
        { id: 'cp-2', name: 'B', description: '', points: 1 },
        { id: 'cp-3', name: 'C', description: '', points: 1 },
        { id: 'cp-4', name: 'D', description: '', points: 1 },
      ],
    }
    expect(validateStepCorePaths(draft)).toBe('You must have exactly 3 Core Paths.')
  })

  it('returns an error when total points do not equal 5', () => {
    const draft = {
      ...baseDraft,
      corePaths: [
        { id: 'cp-1', name: 'Combat', description: '', points: 1 },
        { id: 'cp-2', name: 'Survival', description: '', points: 1 },
        { id: 'cp-3', name: 'Lore', description: '', points: 1 },
      ],
    }
    expect(validateStepCorePaths(draft)).toBe('You must spend exactly 5 points (currently 3).')
  })

  it('returns an error when a path has an empty name', () => {
    const draft = {
      ...baseDraft,
      corePaths: [
        { id: 'cp-1', name: '', description: '', points: 2 },
        { id: 'cp-2', name: 'Survival', description: '', points: 2 },
        { id: 'cp-3', name: 'Lore', description: '', points: 1 },
      ],
    }
    expect(validateStepCorePaths(draft)).toBe('All Core Paths must have a name.')
  })

  it('returns null when 3 paths are set with exactly 5 points and all named', () => {
    expect(validateStepCorePaths({ ...baseDraft, corePaths: validPaths })).toBeNull()
  })
})
