import type { Weapon, ArmorItem, Artifact } from './equipment'

export type { Weapon, ArmorItem, Artifact }

export type Race = 'Valla' | 'Furian' | 'Human' | 'Afflicted'

export type ClassName =
  | 'Dreadnought'
  | 'Driftwalker'
  | 'Fell Hunter'
  | 'Judge'
  | 'Mystic'
  | 'Phantom'
  | 'Priest'
  | 'Primalist'
  | 'Sentinel'

export interface Attributes {
  might: number
  agility: number
  mind: number
  presence: number
}

export interface ClassResource {
  name: string
  current: number
  max: number
  rechargeDie: string
}

export interface SecondaryResource {
  name: string
  current: number
  max: number
}

export interface CorePath {
  id: string
  name: string
  description: string
  points: number
}

export type ActionType =
  | 'Standard'
  | 'Quick'
  | 'Movement'
  | 'Free'
  | 'Reaction'
  | 'Maintain'
  | 'Overdrive'
  | 'Ultimate'
  | 'Passive'

export interface PowerUpgrade {
  id: string
  name: string
  description: string
  purchased: boolean
}

export interface Power {
  id: string
  name: string
  tier: 1 | 2
  actionType: ActionType
  cost: string
  target: string
  range: string
  effectsText: string
  upgrades: PowerUpgrade[]
}

export type PerkSource = 'Class' | 'General'

export interface Perk {
  id: string
  name: string
  description: string
  source: PerkSource
}

export interface Character {
  id: string
  name: string
  race: Race
  className: ClassName
  level: number
  xp: number
  age: string
  notes: string

  attributes: Attributes

  // AR/DR bonuses from leveling (added on top of derived values)
  arBonus: number
  drBonus: number

  currentHp: number
  fadingStacks: number

  primaryResource: ClassResource
  secondaryResource: SecondaryResource | null

  // Max recuperations bonus from class/leveling (base is 2 + floor(might/2))
  recuperationBonus: number
  recuperationDie: string

  corePaths: CorePath[]
  powers: Power[]
  perks: Perk[]
  weapons: Weapon[]
  armor: ArmorItem[]
  artifacts: Artifact[]
  artifactCapacity: number

  denerim: number
  necessities: number
  gear: number
}


export interface CharacterSummary {
  id: string
  name: string
  className: ClassName
  race: Race
  level: number
}

export type CreateCharacterDto = Omit<Character, 'id'>
