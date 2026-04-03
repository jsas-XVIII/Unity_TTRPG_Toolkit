// stepValidators.test.ts — unit tests for wizard step validation logic.

import { describe, it, expect } from 'vitest'
import { validateStepPerk } from './stepValidators'
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
