import type { DiceType, BenHinState, AttributeKey, RollResult } from '../types/dice'
import type { DerivedStats } from './derivedStats'
import type { Attributes } from '../types/character'

export type RngFn = () => number

const defaultRng: RngFn = () => Math.random()

function rollD(sides: number, rng: RngFn): number {
  return Math.floor(rng() * sides) + 1
}

interface DiceRollOutcome {
  allDice: number[]
  keptDice: number[]
  isCrit: boolean
}

function roll2d10Normal(rng: RngFn): DiceRollOutcome {
  const a = rollD(10, rng)
  const b = rollD(10, rng)
  return {
    allDice: [a, b],
    keptDice: [a, b],
    isCrit: a === b,
  }
}

function roll2d10Benefit(rng: RngFn): DiceRollOutcome {
  const dice = [rollD(10, rng), rollD(10, rng), rollD(10, rng)].sort((a, b) => b - a)
  const kept = [dice[0], dice[1]]
  const dropped = dice[2]
  // Crit if any two of the three dice match (including the dropped die)
  const isCrit = dice[0] === dice[1] || dice[0] === dropped || dice[1] === dropped
  return { allDice: dice, keptDice: kept, isCrit }
}

function roll2d10Hindrance(rng: RngFn): DiceRollOutcome {
  const dice = [rollD(10, rng), rollD(10, rng), rollD(10, rng)].sort((a, b) => a - b)
  const kept = [dice[0], dice[1]]
  return { allDice: dice, keptDice: kept, isCrit: false }
}

function rollOther(type: DiceType, rng: RngFn): DiceRollOutcome {
  if (type === '2d6') {
    const a = rollD(6, rng)
    const b = rollD(6, rng)
    return { allDice: [a, b], keptDice: [a, b], isCrit: false }
  }
  const sides = parseInt(type.replace('d', ''), 10)
  const v = rollD(sides, rng)
  return { allDice: [v], keptDice: [v], isCrit: false }
}

export interface BuildRollParams {
  characterId: string
  label: string
  dice: DiceType
  benHin: BenHinState
  attributeKey: AttributeKey
  useHalfLevel: boolean
  miscBonus: number
  attributes: Attributes
  derived: DerivedStats
  rng?: RngFn
}

export function buildRollResult(params: BuildRollParams): RollResult {
  const {
    characterId,
    label,
    dice,
    benHin,
    attributeKey,
    useHalfLevel,
    miscBonus,
    attributes,
    derived,
    rng = defaultRng,
  } = params

  let outcome: DiceRollOutcome
  if (dice === '2d10') {
    if (benHin === 'benefit') outcome = roll2d10Benefit(rng)
    else if (benHin === 'hindrance') outcome = roll2d10Hindrance(rng)
    else outcome = roll2d10Normal(rng)
  } else {
    outcome = rollOther(dice, rng)
  }

  const attributeBonus = resolveAttributeBonus(attributeKey, attributes)
  const halfLevelBonus = dice === '2d10' && useHalfLevel ? derived.hl : 0
  const diceSum = outcome.keptDice.reduce((s, v) => s + v, 0)
  const total = diceSum + attributeBonus + halfLevelBonus + miscBonus

  return {
    characterId,
    label,
    dice,
    benHin,
    allDice: outcome.allDice,
    keptDice: outcome.keptDice,
    attributeBonus,
    halfLevelBonus,
    miscBonus,
    total,
    isCrit: outcome.isCrit,
    timestamp: Date.now(),
  }
}

function resolveAttributeBonus(key: AttributeKey, attributes: Attributes): number {
  if (key === 'none') return 0
  return attributes[key]
}

export interface Roll20MacroParams {
  dice: DiceType
  benHin: BenHinState
  totalBonus: number
  label: string
}

export function buildRoll20Macro({ dice, benHin, totalBonus, label }: Roll20MacroParams): string {
  let diceExpr: string
  if (dice === '2d10') {
    if (benHin === 'benefit') diceExpr = '3d10kh2'
    else if (benHin === 'hindrance') diceExpr = '3d10kl2'
    else diceExpr = '2d10'
  } else if (dice === '2d6') {
    diceExpr = '2d6'
  } else {
    diceExpr = dice
  }

  const bonusPart = totalBonus !== 0 ? (totalBonus > 0 ? `+${totalBonus}` : `${totalBonus}`) : ''
  const labelPart = label.trim() ? ` [${label.trim()}]` : ''
  return `/roll ${diceExpr}${bonusPart}${labelPart}`
}

export function quickAttackRoll(
  characterId: string,
  attributes: Attributes,
  derived: DerivedStats,
  benHin: BenHinState,
  rng?: RngFn
): RollResult {
  return buildRollResult({
    characterId,
    label: 'Attack',
    dice: '2d10',
    benHin,
    attributeKey: 'none',
    useHalfLevel: false,
    miscBonus: derived.ar,
    attributes,
    derived,
    rng,
  })
}

export function quickDefenseRoll(
  characterId: string,
  attributes: Attributes,
  derived: DerivedStats,
  benHin: BenHinState,
  rng?: RngFn
): RollResult {
  return buildRollResult({
    characterId,
    label: 'Defense',
    dice: '2d10',
    benHin,
    attributeKey: 'none',
    useHalfLevel: false,
    miscBonus: derived.dr,
    attributes,
    derived,
    rng,
  })
}

export function quickMindResistRoll(
  characterId: string,
  attributes: Attributes,
  derived: DerivedStats,
  benHin: BenHinState,
  rng?: RngFn
): RollResult {
  return buildRollResult({
    characterId,
    label: 'Mind Resist',
    dice: '2d10',
    benHin,
    attributeKey: 'none',
    useHalfLevel: false,
    miscBonus: derived.mr,
    attributes,
    derived,
    rng,
  })
}
