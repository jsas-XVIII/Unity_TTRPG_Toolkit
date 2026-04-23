export type MonsterType = 'Standard' | 'Elite'
export type MonsterSize = 'Small' | 'Medium' | 'Large' | 'Colossal'
export type MonsterAbilityKind = 'trait' | 'power'

export interface MonsterAbility {
  id: string
  name: string
  kind: MonsterAbilityKind
  ruinCost?: number | null
  recharge?: number | null
  description: string
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
  dmg: number
  damageDie: string
  traitIds: string[]
  powerIds: string[]
  imageUrl?: string
  notes?: string
}
