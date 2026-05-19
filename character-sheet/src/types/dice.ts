export type DiceType = '2d10' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | '2d6'
export type BenHinState = 'normal' | 'benefit' | 'hindrance'
export type AttributeKey = 'none' | 'might' | 'agility' | 'mind' | 'presence'

export interface RollResult {
  characterId: string
  label: string
  dice: DiceType
  benHin: BenHinState
  allDice: number[]
  keptDice: number[]
  attributeBonus: number
  halfLevelBonus: number
  miscBonus: number
  total: number
  isCrit: boolean
  timestamp: number
}
