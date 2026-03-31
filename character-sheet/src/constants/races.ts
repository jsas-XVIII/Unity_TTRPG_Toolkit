import type { Race } from '../types/character'
import type { Attributes } from '../types/character'

export interface RaceDefinition {
  name: Race
  motto: string
  baseAttributes: Attributes
  racialPowerName: string
  racialPowerDescription: string
}

export const RACES: RaceDefinition[] = [
  {
    name: 'Valla',
    motto: 'Together as one.',
    baseAttributes: { might: 0, agility: 2, mind: 1, presence: 1 },
    racialPowerName: 'Harmony',
    racialPowerDescription:
      'Free action — grant self + all Adjacent Allies HL+1d4 bonus to Defense vs. one incoming attack, OR form empathic bond with one Nearby Ally granting +1d4 bonus on one skill check. Must activate before the roll. Once per Full Rest.',
  },
  {
    name: 'Furian',
    motto: 'Strength, duty, and honour.',
    baseAttributes: { might: 2, agility: 1, mind: 0, presence: 1 },
    racialPowerName: 'Unbound',
    racialPowerDescription:
      'Deal highest Attribute score as extra damage on one attack, OR add HL to MIGHT on a skill check. Once per Full Rest safely. On additional uses, roll 1d10 — below 6 causes Unbound attack on a random ally or self. Threshold increases by 1 per subsequent attempt.',
  },
  {
    name: 'Human',
    motto: 'Believe.',
    baseAttributes: { might: 1, agility: 1, mind: 1, presence: 1 },
    racialPowerName: 'Tenacious',
    racialPowerDescription:
      'Re-roll any single roll and use the preferred result. Once per Full Rest.',
  },
  {
    name: 'Afflicted',
    motto: 'We will persevere.',
    baseAttributes: { might: 1, agility: 1, mind: 2, presence: 0 },
    racialPowerName: 'Grisly Triage',
    racialPowerDescription:
      'After battle, harvest fresh corpses to heal 1d6 + (2×Level) HP. Spend 5 minutes + 1 Gear to scavenge for 1 Recuperation. Once per Full Rest.',
  },
]

export const RACE_MAP = Object.fromEntries(RACES.map((r) => [r.name, r])) as Record<
  Race,
  RaceDefinition
>
