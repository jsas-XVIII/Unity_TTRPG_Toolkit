// advancementData.ts — Static advancement table data, XP thresholds, AR/DR patterns,
// and the applyLevelUp() function that computes all automatic bonuses for a level-up.

import type { ClassName, Character } from '../types/character'
import type { ClassDefinition } from '../types/class'

// ---------------------------------------------------------------------------
// XP Thresholds
// Index = level number. null means no XP threshold (starting level).
// ---------------------------------------------------------------------------
export const XP_THRESHOLDS: readonly (number | null)[] = [
  null, // index 0 — unused
  null, // Level 1 — starting level, no threshold
  800, // Level 2
  2000, // Level 3
  3500, // Level 4
  6500, // Level 5
  12000, // Level 6
  20000, // Level 7
  30000, // Level 8
  60000, // Level 9
  120000, // Level 10
]

// ---------------------------------------------------------------------------
// Advancement Rows
// Universal across all classes — AR/DR is handled separately per pattern.
// Index 0 = Level 1 (no gains), Index 9 = Level 10.
// ---------------------------------------------------------------------------
export interface AdvancementRow {
  level: number
  hpBoost: boolean
  corePathPoint: boolean
  attrBoost: boolean
  recuperation: boolean
  generalPerk: boolean
  artifactCapacity: boolean
  t1Token: boolean
  t2Token: boolean
}

export const ADVANCEMENT_ROWS: readonly AdvancementRow[] = [
  {
    level: 1,
    hpBoost: false,
    corePathPoint: false,
    attrBoost: false,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: false,
    t1Token: false,
    t2Token: false,
  },
  {
    level: 2,
    hpBoost: true,
    corePathPoint: true,
    attrBoost: false,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: false,
    t1Token: true,
    t2Token: false,
  },
  {
    level: 3,
    hpBoost: false,
    corePathPoint: false,
    attrBoost: true,
    recuperation: true,
    generalPerk: true,
    artifactCapacity: false,
    t1Token: false,
    t2Token: false,
  },
  {
    level: 4,
    hpBoost: true,
    corePathPoint: true,
    attrBoost: false,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: true,
    t1Token: true,
    t2Token: false,
  },
  {
    level: 5,
    hpBoost: false,
    corePathPoint: false,
    attrBoost: true,
    recuperation: true,
    generalPerk: false,
    artifactCapacity: false,
    t1Token: true,
    t2Token: false,
  },
  {
    level: 6,
    hpBoost: true,
    corePathPoint: true,
    attrBoost: false,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: false,
    t1Token: false,
    t2Token: true,
  },
  {
    level: 7,
    hpBoost: false,
    corePathPoint: false,
    attrBoost: true,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: true,
    t1Token: true,
    t2Token: true,
  },
  {
    level: 8,
    hpBoost: true,
    corePathPoint: true,
    attrBoost: false,
    recuperation: true,
    generalPerk: false,
    artifactCapacity: false,
    t1Token: true,
    t2Token: false,
  },
  {
    level: 9,
    hpBoost: false,
    corePathPoint: false,
    attrBoost: true,
    recuperation: false,
    generalPerk: true,
    artifactCapacity: false,
    t1Token: false,
    t2Token: true,
  },
  {
    level: 10,
    hpBoost: true,
    corePathPoint: true,
    attrBoost: false,
    recuperation: false,
    generalPerk: false,
    artifactCapacity: true,
    t1Token: true,
    t2Token: true,
  },
]

// ---------------------------------------------------------------------------
// AR/DR Patterns
// Three class archetypes with different combat stat growth curves.
// Gains are applied at levels 4, 7, and 10 in that order.
// ---------------------------------------------------------------------------
export type ArDrPattern = 'balanced' | 'aggressive' | 'glass-cannon'

export const CLASS_AR_DR_PATTERN: Record<ClassName, ArDrPattern> = {
  Dreadnought: 'balanced',
  Driftwalker: 'balanced',
  'Fell Hunter': 'aggressive',
  Judge: 'balanced',
  Mystic: 'glass-cannon',
  Phantom: 'aggressive',
  Priest: 'balanced',
  Primalist: 'balanced',
  Sentinel: 'balanced',
}

// [ar, dr] gains at levels 4, 7, 10 respectively
const AR_DR_GAINS: Record<ArDrPattern, readonly [number, number][]> = {
  balanced: [
    [1, 1],
    [1, 1],
    [1, 1],
  ],
  aggressive: [
    [2, 0],
    [1, 1],
    [2, 0],
  ],
  'glass-cannon': [
    [2, 0],
    [2, 0],
    [2, 0],
  ],
}

export function getArDrGainAtLevel(className: ClassName, level: number): [number, number] {
  const pattern = CLASS_AR_DR_PATTERN[className]
  const gains = AR_DR_GAINS[pattern]
  if (level === 4) return [gains[0][0], gains[0][1]]
  if (level === 7) return [gains[1][0], gains[1][1]]
  if (level === 10) return [gains[2][0], gains[2][1]]
  return [0, 0]
}

// Returns the cumulative AR/DR bonuses a character should have by a given level.
// Useful for auditing or correcting existing characters.
export function getCumulativeArDrByLevel(className: ClassName, level: number): [number, number] {
  let ar = 0
  let dr = 0
  for (let lv = 2; lv <= level; lv++) {
    const [a, d] = getArDrGainAtLevel(className, lv)
    ar += a
    dr += d
  }
  return [ar, dr]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseDieMax(die: string): number {
  const match = die.match(/d(\d+)/)
  return match ? parseInt(match[1], 10) : 6
}

// ---------------------------------------------------------------------------
// applyLevelUp
// Applies all automatic bonuses for leveling from character.level to level+1.
// Returns the updated character and a checklist of choices that require manual action.
// ---------------------------------------------------------------------------
export interface LevelUpResult {
  updated: Character
  checklist: string[]
}

export function applyLevelUp(character: Character, classDef: ClassDefinition): LevelUpResult {
  const newLevel = character.level + 1
  if (newLevel > 10) return { updated: character, checklist: [] }

  // Row is 0-indexed: Level 1 = index 0, Level 10 = index 9
  const row = ADVANCEMENT_ROWS[newLevel - 1]
  const [arGain, drGain] = getArDrGainAtLevel(character.className, newLevel)

  // HP Boost = recuperation die max + MIGHT at time of level-up
  const hpGain = row.hpBoost
    ? parseDieMax(character.recuperationDie) + character.attributes.might
    : 0

  // New max HP after this level-up (mirrors computeDerivedStats formula)
  const newMaxHp = classDef.hpBase + character.attributes.might + character.hpBonus + hpGain

  const updated: Character = {
    ...character,
    level: newLevel,
    arBonus: character.arBonus + arGain,
    drBonus: character.drBonus + drGain,
    recuperationBonus: character.recuperationBonus + (row.recuperation ? 1 : 0),
    artifactCapacity: character.artifactCapacity + (row.artifactCapacity ? 1 : 0),
    hpBonus: character.hpBonus + hpGain,
    currentHp: newMaxHp,
    primaryResource: {
      ...character.primaryResource,
      current: character.primaryResource.max,
    },
  }

  const checklist: string[] = []
  if (row.attrBoost) checklist.push('Choose +1 to any Attribute in the Attributes section.')
  if (row.corePathPoint) checklist.push('Spend 1 Core Path Point in the Core Paths section.')
  if (row.generalPerk) checklist.push('Select a General Perk in the Perks section.')
  if (row.t1Token) checklist.push('Choose a Tier I Power or Upgrade in the Powers section.')
  if (row.t2Token) checklist.push('Choose a Tier II Power or Upgrade in the Powers section.')
  if (newLevel === 3 || newLevel === 8 || newLevel === 10)
    checklist.push(
      `New class feature unlocked — check the Powers section for your Level ${newLevel} ability.`
    )

  return { updated, checklist }
}
