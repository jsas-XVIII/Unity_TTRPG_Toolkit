import type { Weapon, ArmorItem } from './equipment'

export type { Weapon, ArmorItem }

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
  tier: 1 | 2 | 'baseline' | 'lv3' | 'lv8' | 'lv10'
  restrictToClassPath?: string
  actionType: ActionType
  additionalActionTypes?: ActionType[]
  cost: string
  target: string
  range: string
  effectsText: string
  upgrades: PowerUpgrade[]
}

// Stored on the Character — references a power by ID and tracks only mutable state.
// Full power data is resolved at render time from powers.json.
export interface CharacterPower {
  id: string
  purchasedUpgradeIds: string[]
  // 'free_lv5' marks a Tier II power granted for free at Level 5 (does not spend a token).
  // Absent or 'purchased' means the power was bought with a token.
  source?: 'purchased' | 'free_lv5'
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
  // Optional — only set for classes that have class paths (e.g. Priest: 'chaplain' | 'warpriest')
  classPath?: string | null
  level: number
  xp: number
  age: string
  notes: string

  attributes: Attributes

  // AR/DR bonuses from leveling (added on top of derived values)
  arBonus: number
  drBonus: number

  // Cumulative Max HP bonus from HP Boosts gained at even levels (die max + MIGHT at time of level-up)
  hpBonus: number

  currentHp: number
  fadingStacks: number

  primaryResource: ClassResource
  secondaryResource: SecondaryResource | null

  // Max recuperations bonus from class/leveling (base is 2 + floor(might/2))
  recuperationBonus: number
  recuperationDie: string

  corePaths: CorePath[]
  powers: CharacterPower[]
  // Upgrade selections for derived feature powers (lv3/lv8/lv10/baseline).
  // Keyed by power id; value is array of purchased upgrade ids.
  // Optional so existing saves deserialize cleanly without migration.
  featureUpgrades?: Record<string, string[]>
  // IDs of Overdrive/Ultimate powers that have been used this Full Rest.
  // Optional so existing saves deserialize cleanly without migration.
  usedPowerIds?: string[]
  perks: Perk[]
  weapons: Weapon[]
  armor: ArmorItem[]
  artifactIds: string[]
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

export type CreateCharacterDto = Omit<Character, 'id'> & { id?: string }
