export type MonsterType = 'Standard' | 'Elite'
export type MonsterSize = 'Small' | 'Medium' | 'Large' | 'Massive' | 'Colossal'
export type MonsterAbilityKind = 'trait' | 'power'

export interface MonsterAttack {
  name: string
  range: string
  damage: string
}

export interface MonsterAbility {
  id: string
  name: string
  kind: MonsterAbilityKind
  ruinCost?: number | null
  recharge?: number | null
  description: string
}

export interface MonsterTemplate {
  id: string
  name: string
  description?: string
  hpDelta: number
  arDelta: number
  drDelta: number
  mrDelta: number
  avDelta: number
  spdDelta: number
  mightDelta: number
  agilityDelta: number
  mindDelta: number
  presenceDelta: number
  addTraitIds: string[]
  removeTraitIds: string[]
  addPowerIds: string[]
  removePowerIds: string[]
}

export interface Monster {
  id: string
  name: string
  dangerLevel: number
  type: MonsterType
  size: MonsterSize
  faction: string | null
  xp: number
  hp: number
  ar: number
  dr: number
  mr: number
  av: number
  spd: number
  might: number
  agility: number
  mind: number
  presence: number
  attacks: MonsterAttack[]
  traitIds: string[]
  powerIds: string[]
  imageUrl?: string
  notes?: string
}
