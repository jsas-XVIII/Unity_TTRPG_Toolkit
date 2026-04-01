// derivedStats.ts — pure computation functions for stats that are always calculated,
// never stored. These are recomputed on every render in useCharacter whenever
// the character's attributes, level, armor, or class changes.
//
// "Pure" means: given the same inputs, always returns the same output.
// No side effects, no external state — makes these trivial to unit test.

import type { Character } from '../types/character'
import type { ClassDefinition } from '../types/class'

// The shape of the computed stats object returned to components
export interface DerivedStats {
  ar: number // Attack Rating
  dr: number // Defense Rating
  mr: number // Mental Resistance
  speed: number // Movement speed
  av: number // Armor Value (sum of all equipped armor)
  maxHp: number // Maximum hit points
  maxRecuperations: number
  hl: number // Half Level — used in some power / ability formulas
}

// ---------------------------------------------------------------------------
// computeDerivedStats
// Mirrors the formulas defined in PLAN.md § Derived Stats.
// ---------------------------------------------------------------------------
export function computeDerivedStats(char: Character, classDef: ClassDefinition): DerivedStats {
  const { attributes, level, arBonus, drBonus, recuperationBonus } = char

  // Each class has one "main attribute" (MIGHT, AGILITY, or MIND) that drives Attack Rating
  const mainAttr = attributes[classDef.mainAttribute]

  // AR: main attribute + any flat bonuses gained from leveling or equipment
  const ar = mainAttr + arBonus

  // DR: always based on AGILITY regardless of class
  const dr = attributes.agility + drBonus

  // MR: always based on MIND, no class modifier
  const mr = attributes.mind

  // Speed: base AGILITY (no bonus tracked yet — placeholder for future gear bonuses)
  const speed = attributes.agility

  // HL: minimum 1 so low-level characters still have a non-zero half-level
  const hl = Math.max(1, Math.floor(level / 2))

  // AV: sum the av value of every piece of equipped armor
  const av = char.armor.reduce((sum, a) => sum + a.av, 0)

  // Max HP: class-specific base + MIGHT modifier
  const maxHp = classDef.hpBase + attributes.might

  // Recuperations: base 2 + every 2 points of MIGHT adds 1 + any class/feat bonuses
  const maxRecuperations = 2 + Math.floor(attributes.might / 2) + recuperationBonus

  return { ar, dr, mr, speed, av, maxHp, maxRecuperations, hl }
}
