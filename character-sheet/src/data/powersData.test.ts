// powersData.test.ts — unit tests for power data lookup and class path filtering.

import { describe, it, expect } from 'vitest'
import { getPowersByClass, getPowerById, getTokenBudget, isOfficialPower } from './powersData'

describe('getPowersByClass — Priest baseline powers', () => {
  const { baseline } = getPowersByClass('Priest')

  it('includes Healing Charge (shared by all Priests)', () => {
    expect(baseline.some((p) => p.id === 'healing-charge')).toBe(true)
  })

  it('includes Sacred Bolt restricted to chaplain', () => {
    const power = baseline.find((p) => p.id === 'sacred-bolt')
    expect(power).toBeDefined()
    expect(power?.restrictToClassPath).toBe('chaplain')
  })

  it('includes Holy Strike restricted to warpriest', () => {
    const power = baseline.find((p) => p.id === 'holy-strike')
    expect(power).toBeDefined()
    expect(power?.restrictToClassPath).toBe('warpriest')
  })

  it('healing-charge has no class path restriction', () => {
    const power = baseline.find((p) => p.id === 'healing-charge')
    expect(power?.restrictToClassPath).toBeUndefined()
  })
})

describe('getPowersByClass — baseline filtering by classPath', () => {
  const { baseline } = getPowersByClass('Priest')

  function forPath(classPath: string) {
    return baseline.filter((p) => !p.restrictToClassPath || p.restrictToClassPath === classPath)
  }

  it('Chaplain sees Sacred Bolt and Healing Charge, not Holy Strike', () => {
    const powers = forPath('chaplain')
    const ids = powers.map((p) => p.id)
    expect(ids).toContain('sacred-bolt')
    expect(ids).toContain('healing-charge')
    expect(ids).not.toContain('holy-strike')
  })

  it('War Priest sees Holy Strike and Healing Charge, not Sacred Bolt', () => {
    const powers = forPath('warpriest')
    const ids = powers.map((p) => p.id)
    expect(ids).toContain('holy-strike')
    expect(ids).toContain('healing-charge')
    expect(ids).not.toContain('sacred-bolt')
  })
})

describe('getPowersByClass — all non-Priest classes have baseline powers', () => {
  const classes = [
    'Dreadnought',
    'Driftwalker',
    'Fell Hunter',
    'Judge',
    'Mystic',
    'Phantom',
    'Primalist',
    'Sentinel',
  ] as const

  it.each(classes)('%s has at least 2 baseline powers', (cls) => {
    const { baseline } = getPowersByClass(cls)
    expect(baseline.length).toBeGreaterThanOrEqual(2)
  })

  it.each(classes)('%s baseline powers all have tier "baseline"', (cls) => {
    const { baseline } = getPowersByClass(cls)
    expect(baseline.every((p) => p.tier === 'baseline')).toBe(true)
  })
})

describe('getPowersByClass — lv3/lv8/lv10 pools (Dreadnought)', () => {
  it('lv3 pool contains Heart of the Mountain', () => {
    const { lv3 } = getPowersByClass('Dreadnought')
    expect(lv3.some((p) => p.id === 'dreadnought-heart-of-the-mountain')).toBe(true)
  })

  it('lv8 pool contains Fearless', () => {
    const { lv8 } = getPowersByClass('Dreadnought')
    expect(lv8.some((p) => p.id === 'dreadnought-fearless')).toBe(true)
  })

  it('lv10 pool contains Split the Earth', () => {
    const { lv10 } = getPowersByClass('Dreadnought')
    expect(lv10.some((p) => p.id === 'dreadnought-split-the-earth')).toBe(true)
  })

  it('lv3 powers have tier "lv3"', () => {
    const { lv3 } = getPowersByClass('Dreadnought')
    expect(lv3.every((p) => p.tier === 'lv3')).toBe(true)
  })
})

describe('getPowerById — finds new baseline and feature powers', () => {
  it('finds dreadnought-shieldbreaker in baseline', () => {
    const result = getPowerById('dreadnought-shieldbreaker')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Armour Pierce')
    expect(result?.className).toBe('Dreadnought')
    expect(result?.power.tier).toBe('baseline')
  })

  it('finds dreadnought-heart-of-the-mountain in lv3', () => {
    const result = getPowerById('dreadnought-heart-of-the-mountain')
    expect(result).toBeDefined()
    expect(result?.power.tier).toBe('lv3')
    expect(result?.className).toBe('Dreadnought')
  })
})

describe('getPowerById — finds Priest baseline powers by id', () => {
  it('finds sacred-bolt', () => {
    const result = getPowerById('sacred-bolt')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Divine Shot')
    expect(result?.className).toBe('Priest')
  })

  it('finds holy-strike', () => {
    const result = getPowerById('holy-strike')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Blessed Strike')
  })

  it('finds healing-charge', () => {
    const result = getPowerById('healing-charge')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Mending Charge')
  })

  it('returns undefined for an unknown id', () => {
    expect(getPowerById('not-a-real-power')).toBeUndefined()
  })
})

describe('getTokenBudget — correct values at each level', () => {
  it('level 1 returns tier1=3, tier2=0', () => {
    expect(getTokenBudget(1)).toEqual({ tier1: 3, tier2: 0 })
  })

  it('level 2 returns tier1=4, tier2=0', () => {
    expect(getTokenBudget(2)).toEqual({ tier1: 4, tier2: 0 })
  })

  it('level 3 returns tier1=4, tier2=0', () => {
    expect(getTokenBudget(3)).toEqual({ tier1: 4, tier2: 0 })
  })

  it('level 4 returns tier1=5, tier2=0', () => {
    expect(getTokenBudget(4)).toEqual({ tier1: 5, tier2: 0 })
  })

  it('level 5 returns tier1=6, tier2=0', () => {
    expect(getTokenBudget(5)).toEqual({ tier1: 6, tier2: 0 })
  })

  it('level 6 returns tier1=6, tier2=1', () => {
    expect(getTokenBudget(6)).toEqual({ tier1: 6, tier2: 1 })
  })

  it('level 7 returns tier1=7, tier2=2', () => {
    expect(getTokenBudget(7)).toEqual({ tier1: 7, tier2: 2 })
  })

  it('level 8 returns tier1=8, tier2=2', () => {
    expect(getTokenBudget(8)).toEqual({ tier1: 8, tier2: 2 })
  })

  it('level 9 returns tier1=8, tier2=3', () => {
    expect(getTokenBudget(9)).toEqual({ tier1: 8, tier2: 3 })
  })

  it('level 10 returns tier1=9, tier2=4', () => {
    expect(getTokenBudget(10)).toEqual({ tier1: 9, tier2: 4 })
  })
})

describe('isOfficialPower', () => {
  it('returns true for a known Dreadnought baseline power', () => {
    expect(isOfficialPower('dreadnought-shieldbreaker')).toBe(true)
  })

  it('returns true for a power from a non-Dreadnought class', () => {
    expect(isOfficialPower('healing-charge')).toBe(true)
  })

  it('returns true for a feature pool power (lv3)', () => {
    expect(isOfficialPower('dreadnought-heart-of-the-mountain')).toBe(true)
  })

  it('returns false for an unknown id', () => {
    expect(isOfficialPower('not-a-real-power')).toBe(false)
  })

  it('returns false for a homebrew-prefixed id that does not exist in the JSON', () => {
    expect(isOfficialPower('hb-power-12345')).toBe(false)
  })
})

describe('getTokenBudget — clamping behavior', () => {
  it('level 0 clamps to level 1 values (tier1=3, tier2=0)', () => {
    expect(getTokenBudget(0)).toEqual({ tier1: 3, tier2: 0 })
  })

  it('negative level clamps to level 1 values', () => {
    expect(getTokenBudget(-5)).toEqual({ tier1: 3, tier2: 0 })
  })

  it('level 11 clamps to level 10 values (tier1=9, tier2=4)', () => {
    expect(getTokenBudget(11)).toEqual({ tier1: 9, tier2: 4 })
  })

  it('very large level clamps to level 10 values', () => {
    expect(getTokenBudget(999)).toEqual({ tier1: 9, tier2: 4 })
  })
})
