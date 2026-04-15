// advancementData.test.ts — unit tests for the advancement table data and level-up logic.
//
// Covers:
//   - XP_THRESHOLDS values
//   - ADVANCEMENT_ROWS structure
//   - getArDrGainAtLevel() for all three AR/DR patterns
//   - getCumulativeArDrByLevel() totals
//   - applyLevelUp() auto-applied bonuses, checklist contents, HP/resource resets

import { describe, it, expect } from 'vitest'
import {
  XP_THRESHOLDS,
  ADVANCEMENT_ROWS,
  getArDrGainAtLevel,
  getCumulativeArDrByLevel,
  applyLevelUp,
} from './advancementData'
import { CLASS_MAP } from '../constants/classes'
import { baseCharacter } from '../test/fixtures'

// ---------------------------------------------------------------------------
// XP_THRESHOLDS
// ---------------------------------------------------------------------------
describe('XP_THRESHOLDS', () => {
  it('index 0 is unused (null)', () => {
    expect(XP_THRESHOLDS[0]).toBeNull()
  })

  it('level 1 has no threshold (starting level)', () => {
    expect(XP_THRESHOLDS[1]).toBeNull()
  })

  it('requires 800 XP to reach level 2', () => {
    expect(XP_THRESHOLDS[2]).toBe(800)
  })

  it('requires 3500 XP to reach level 4', () => {
    expect(XP_THRESHOLDS[4]).toBe(3500)
  })

  it('requires 120000 XP to reach level 10', () => {
    expect(XP_THRESHOLDS[10]).toBe(120000)
  })

  it('has 11 entries (index 0 unused + levels 1–10)', () => {
    expect(XP_THRESHOLDS.length).toBe(11)
  })
})

// ---------------------------------------------------------------------------
// ADVANCEMENT_ROWS
// ---------------------------------------------------------------------------
describe('ADVANCEMENT_ROWS', () => {
  it('has 10 rows (one per level)', () => {
    expect(ADVANCEMENT_ROWS.length).toBe(10)
  })

  it('level 1 row grants nothing', () => {
    const row = ADVANCEMENT_ROWS[0]
    expect(row.hpBoost).toBe(false)
    expect(row.corePathPoint).toBe(false)
    expect(row.attrBoost).toBe(false)
    expect(row.recuperation).toBe(false)
    expect(row.generalPerk).toBe(false)
    expect(row.artifactCapacity).toBe(false)
    expect(row.t1Token).toBe(false)
    expect(row.t2Token).toBe(false)
  })

  it('level 2 grants HP boost, core path point, and T1 token', () => {
    const row = ADVANCEMENT_ROWS[1]
    expect(row.hpBoost).toBe(true)
    expect(row.corePathPoint).toBe(true)
    expect(row.t1Token).toBe(true)
    expect(row.t2Token).toBe(false)
  })

  it('level 3 grants attribute boost, recuperation, and general perk', () => {
    const row = ADVANCEMENT_ROWS[2]
    expect(row.attrBoost).toBe(true)
    expect(row.recuperation).toBe(true)
    expect(row.generalPerk).toBe(true)
    expect(row.hpBoost).toBe(false)
  })

  it('level 4 grants artifact capacity', () => {
    expect(ADVANCEMENT_ROWS[3].artifactCapacity).toBe(true)
  })

  it('level 5 grants T1 token but not T2', () => {
    const row = ADVANCEMENT_ROWS[4]
    expect(row.t1Token).toBe(true)
    expect(row.t2Token).toBe(false)
  })

  it('level 6 grants first T2 token', () => {
    expect(ADVANCEMENT_ROWS[5].t2Token).toBe(true)
  })

  it('level 9 grants a general perk', () => {
    expect(ADVANCEMENT_ROWS[8].generalPerk).toBe(true)
  })

  it('level 10 grants HP boost, core path point, artifact capacity, T1 and T2 tokens', () => {
    const row = ADVANCEMENT_ROWS[9]
    expect(row.hpBoost).toBe(true)
    expect(row.corePathPoint).toBe(true)
    expect(row.artifactCapacity).toBe(true)
    expect(row.t1Token).toBe(true)
    expect(row.t2Token).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getArDrGainAtLevel — balanced pattern
// ---------------------------------------------------------------------------
describe('getArDrGainAtLevel — balanced (Dreadnought, Judge, Priest, etc.)', () => {
  it('returns +1/+1 at level 4', () => {
    expect(getArDrGainAtLevel('Dreadnought', 4)).toEqual([1, 1])
  })

  it('returns +1/+1 at level 7', () => {
    expect(getArDrGainAtLevel('Judge', 7)).toEqual([1, 1])
  })

  it('returns +1/+1 at level 10', () => {
    expect(getArDrGainAtLevel('Sentinel', 10)).toEqual([1, 1])
  })

  it('returns +0/+0 at non-AR/DR levels', () => {
    for (const lv of [2, 3, 5, 6, 8, 9]) {
      expect(getArDrGainAtLevel('Dreadnought', lv)).toEqual([0, 0])
    }
  })
})

// ---------------------------------------------------------------------------
// getArDrGainAtLevel — aggressive pattern
// ---------------------------------------------------------------------------
describe('getArDrGainAtLevel — aggressive (Fell Hunter, Phantom)', () => {
  it('returns +2/+0 at level 4', () => {
    expect(getArDrGainAtLevel('Fell Hunter', 4)).toEqual([2, 0])
  })

  it('returns +1/+1 at level 7', () => {
    expect(getArDrGainAtLevel('Phantom', 7)).toEqual([1, 1])
  })

  it('returns +2/+0 at level 10', () => {
    expect(getArDrGainAtLevel('Fell Hunter', 10)).toEqual([2, 0])
  })
})

// ---------------------------------------------------------------------------
// getArDrGainAtLevel — glass-cannon pattern
// ---------------------------------------------------------------------------
describe('getArDrGainAtLevel — glass-cannon (Mystic)', () => {
  it('returns +2/+0 at level 4', () => {
    expect(getArDrGainAtLevel('Mystic', 4)).toEqual([2, 0])
  })

  it('returns +2/+0 at level 7', () => {
    expect(getArDrGainAtLevel('Mystic', 7)).toEqual([2, 0])
  })

  it('returns +2/+0 at level 10', () => {
    expect(getArDrGainAtLevel('Mystic', 10)).toEqual([2, 0])
  })

  it('returns +0/+0 at non-AR/DR levels', () => {
    for (const lv of [2, 3, 5, 6, 8, 9]) {
      expect(getArDrGainAtLevel('Mystic', lv)).toEqual([0, 0])
    }
  })
})

// ---------------------------------------------------------------------------
// getCumulativeArDrByLevel
// ---------------------------------------------------------------------------
describe('getCumulativeArDrByLevel', () => {
  it('balanced class reaches +3/+3 by level 10', () => {
    expect(getCumulativeArDrByLevel('Dreadnought', 10)).toEqual([3, 3])
  })

  it('aggressive class reaches +5/+1 by level 10', () => {
    expect(getCumulativeArDrByLevel('Fell Hunter', 10)).toEqual([5, 1])
  })

  it('glass-cannon class reaches +6/+0 by level 10', () => {
    expect(getCumulativeArDrByLevel('Mystic', 10)).toEqual([6, 0])
  })

  it('returns +0/+0 at level 1', () => {
    expect(getCumulativeArDrByLevel('Dreadnought', 1)).toEqual([0, 0])
  })

  it('balanced class has +1/+1 after level 4', () => {
    expect(getCumulativeArDrByLevel('Dreadnought', 4)).toEqual([1, 1])
  })

  it('balanced class has +2/+2 after level 7', () => {
    expect(getCumulativeArDrByLevel('Dreadnought', 7)).toEqual([2, 2])
  })
})

// ---------------------------------------------------------------------------
// applyLevelUp — level 2 (HP boost level, no AR/DR)
// ---------------------------------------------------------------------------
describe('applyLevelUp — leveling to 2', () => {
  const classDef = CLASS_MAP['Dreadnought']
  // baseCharacter: level 1, might=3, recuperationDie='1d6', hpBonus=0
  // HP gain at level 2 = dieMax(1d6) + MIGHT = 6 + 3 = 9

  it('increments level to 2', () => {
    expect(applyLevelUp(baseCharacter, classDef).updated.level).toBe(2)
  })

  it('applies HP boost (die max + MIGHT)', () => {
    expect(applyLevelUp(baseCharacter, classDef).updated.hpBonus).toBe(9)
  })

  it('resets currentHp to new max HP', () => {
    const { updated } = applyLevelUp(baseCharacter, classDef)
    const expectedMax = classDef.hpBase + baseCharacter.attributes.might + updated.hpBonus
    expect(updated.currentHp).toBe(expectedMax)
  })

  it('resets primary resource current to max', () => {
    const char = {
      ...baseCharacter,
      primaryResource: { ...baseCharacter.primaryResource, current: 1 },
    }
    const { updated } = applyLevelUp(char, classDef)
    expect(updated.primaryResource.current).toBe(char.primaryResource.max)
  })

  it('does not change arBonus or drBonus', () => {
    const { updated } = applyLevelUp(baseCharacter, classDef)
    expect(updated.arBonus).toBe(0)
    expect(updated.drBonus).toBe(0)
  })

  it('does not change recuperationBonus', () => {
    expect(applyLevelUp(baseCharacter, classDef).updated.recuperationBonus).toBe(0)
  })

  it('does not change artifactCapacity', () => {
    expect(applyLevelUp(baseCharacter, classDef).updated.artifactCapacity).toBe(
      baseCharacter.artifactCapacity
    )
  })

  it('checklist includes Core Path Point and T1 Token', () => {
    const { checklist } = applyLevelUp(baseCharacter, classDef)
    expect(checklist.some((c) => c.includes('Core Path'))).toBe(true)
    expect(checklist.some((c) => c.includes('Tier I'))).toBe(true)
  })

  it('checklist does not include Attribute Boost, General Perk, or T2 Token', () => {
    const { checklist } = applyLevelUp(baseCharacter, classDef)
    expect(checklist.some((c) => c.includes('Attribute'))).toBe(false)
    expect(checklist.some((c) => c.includes('General Perk'))).toBe(false)
    expect(checklist.some((c) => c.includes('Tier II'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// applyLevelUp — level 3 (recuperation + attr boost + perk, no HP boost)
// ---------------------------------------------------------------------------
describe('applyLevelUp — leveling to 3', () => {
  const classDef = CLASS_MAP['Dreadnought']
  const level2Char = { ...baseCharacter, level: 2 }

  it('adds +1 recuperationBonus', () => {
    expect(applyLevelUp(level2Char, classDef).updated.recuperationBonus).toBe(1)
  })

  it('does not add hpBonus (no HP boost at level 3)', () => {
    expect(applyLevelUp(level2Char, classDef).updated.hpBonus).toBe(0)
  })

  it('checklist includes Attribute Boost and General Perk', () => {
    const { checklist } = applyLevelUp(level2Char, classDef)
    expect(checklist.some((c) => c.includes('Attribute'))).toBe(true)
    expect(checklist.some((c) => c.includes('General Perk'))).toBe(true)
  })

  it('checklist includes class feature unlock hint for level 3', () => {
    const { checklist } = applyLevelUp(level2Char, classDef)
    expect(checklist.some((c) => c.includes('Level 3'))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// applyLevelUp — class feature unlock checklist items (levels 3, 8, 10)
// ---------------------------------------------------------------------------
describe('applyLevelUp — class feature unlock hint at levels 8 and 10', () => {
  const classDef = CLASS_MAP['Dreadnought']

  it('checklist includes class feature unlock hint at level 8', () => {
    const level7Char = { ...baseCharacter, level: 7 }
    const { checklist } = applyLevelUp(level7Char, classDef)
    expect(checklist.some((c) => c.includes('Level 8'))).toBe(true)
  })

  it('checklist includes class feature unlock hint at level 10', () => {
    const level9Char = { ...baseCharacter, level: 9 }
    const { checklist } = applyLevelUp(level9Char, classDef)
    expect(checklist.some((c) => c.includes('Level 10'))).toBe(true)
  })
})

describe('applyLevelUp — non-feature levels have no class feature hint', () => {
  const classDef = CLASS_MAP['Dreadnought']

  it.each([2, 4, 5, 6, 7, 9])(
    'level %i checklist has no class feature hint',
    (targetLevel) => {
      const char = { ...baseCharacter, level: targetLevel - 1 }
      const { checklist } = applyLevelUp(char, classDef)
      expect(checklist.some((c) => c.toLowerCase().includes('class feature'))).toBe(false)
    }
  )
})

// ---------------------------------------------------------------------------
// applyLevelUp — level 4 AR/DR and artifact capacity
// ---------------------------------------------------------------------------
describe('applyLevelUp — leveling to 4 (balanced class)', () => {
  const classDef = CLASS_MAP['Dreadnought']
  const level3Char = { ...baseCharacter, level: 3 }

  it('adds +1 arBonus', () => {
    expect(applyLevelUp(level3Char, classDef).updated.arBonus).toBe(1)
  })

  it('adds +1 drBonus', () => {
    expect(applyLevelUp(level3Char, classDef).updated.drBonus).toBe(1)
  })

  it('adds +1 artifactCapacity', () => {
    expect(applyLevelUp(level3Char, classDef).updated.artifactCapacity).toBe(
      baseCharacter.artifactCapacity + 1
    )
  })
})

describe('applyLevelUp — leveling to 4 (glass-cannon Mystic)', () => {
  const classDef = CLASS_MAP['Mystic']
  const level3Mystic = { ...baseCharacter, className: 'Mystic' as const, level: 3 }

  it('adds +2 arBonus', () => {
    expect(applyLevelUp(level3Mystic, classDef).updated.arBonus).toBe(2)
  })

  it('adds +0 drBonus', () => {
    expect(applyLevelUp(level3Mystic, classDef).updated.drBonus).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// applyLevelUp — secondary resource is not reset
// ---------------------------------------------------------------------------
describe('applyLevelUp — secondary resource is unchanged', () => {
  const classDef = CLASS_MAP['Priest']
  const priestChar = {
    ...baseCharacter,
    className: 'Priest' as const,
    secondaryResource: { name: 'Healing Charges', current: 1, max: 3 },
  }

  it('leaves secondaryResource.current unchanged', () => {
    const { updated } = applyLevelUp(priestChar, classDef)
    expect(updated.secondaryResource?.current).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// applyLevelUp — level 10 cap
// ---------------------------------------------------------------------------
describe('applyLevelUp — level 10 cap', () => {
  const classDef = CLASS_MAP['Dreadnought']
  const level10Char = { ...baseCharacter, level: 10 }

  it('returns the character unchanged when already at level 10', () => {
    expect(applyLevelUp(level10Char, classDef).updated).toEqual(level10Char)
  })

  it('returns an empty checklist when already at level 10', () => {
    expect(applyLevelUp(level10Char, classDef).checklist).toHaveLength(0)
  })
})
