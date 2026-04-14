// powersData.test.ts — unit tests for power data lookup and class path filtering.

import { describe, it, expect } from 'vitest'
import { getPowersByClass, getPowerById, getTokenBudget } from './powersData'

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

describe('getPowerById — finds Priest baseline powers by id', () => {
  it('finds sacred-bolt', () => {
    const result = getPowerById('sacred-bolt')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Sacred Bolt')
    expect(result?.className).toBe('Priest')
  })

  it('finds holy-strike', () => {
    const result = getPowerById('holy-strike')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Holy Strike')
  })

  it('finds healing-charge', () => {
    const result = getPowerById('healing-charge')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Healing Charge')
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
