import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import type { ArtifactDefinition } from '../types/artifact'
import type { ClassPowerPool } from '../data/powersData'

// Separate localStorage key per content type so a partial import is possible.
const KEYS = {
  powers: 'unity_official_powers',
  perks: 'unity_official_perks',
  monsters: 'unity_official_monsters',
  abilities: 'unity_official_abilities',
  artifacts: 'unity_official_artifacts',
} as const

// Cache sentinel: undefined = not yet read from localStorage, null = read and not present.
type OfficialPowers = Record<string, ClassPowerPool>

let powersCache: OfficialPowers | null | undefined = undefined
let perksCache: Perk[] | null | undefined = undefined
let monstersCache: Monster[] | null | undefined = undefined
let abilitiesCache: MonsterAbility[] | null | undefined = undefined
let artifactsCache: ArtifactDefinition[] | null | undefined = undefined

function readItem<T>(key: string, cache: T | null | undefined): T | null {
  if (cache !== undefined) return cache
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

// --- Powers ---

export function getOfficialPowers(): OfficialPowers | null {
  return (powersCache = readItem<OfficialPowers>(KEYS.powers, powersCache))
}

export function setOfficialPowers(data: OfficialPowers): void {
  localStorage.setItem(KEYS.powers, JSON.stringify(data))
  powersCache = data
}

export function clearOfficialPowers(): void {
  localStorage.removeItem(KEYS.powers)
  powersCache = null
}

export function invalidateOfficialPowersCache(): void {
  powersCache = undefined
}

// --- Perks ---

export function getOfficialPerks(): Perk[] | null {
  return (perksCache = readItem<Perk[]>(KEYS.perks, perksCache))
}

export function setOfficialPerks(data: Perk[]): void {
  localStorage.setItem(KEYS.perks, JSON.stringify(data))
  perksCache = data
}

export function clearOfficialPerks(): void {
  localStorage.removeItem(KEYS.perks)
  perksCache = null
}

export function invalidateOfficialPerksCache(): void {
  perksCache = undefined
}

// --- Monsters ---

export function getOfficialMonsters(): Monster[] | null {
  return (monstersCache = readItem<Monster[]>(KEYS.monsters, monstersCache))
}

export function setOfficialMonsters(data: Monster[]): void {
  localStorage.setItem(KEYS.monsters, JSON.stringify(data))
  monstersCache = data
}

export function clearOfficialMonsters(): void {
  localStorage.removeItem(KEYS.monsters)
  monstersCache = null
}

export function invalidateOfficialMonstersCache(): void {
  monstersCache = undefined
}

// --- Abilities ---

export function getOfficialAbilities(): MonsterAbility[] | null {
  return (abilitiesCache = readItem<MonsterAbility[]>(KEYS.abilities, abilitiesCache))
}

export function setOfficialAbilities(data: MonsterAbility[]): void {
  localStorage.setItem(KEYS.abilities, JSON.stringify(data))
  abilitiesCache = data
}

export function clearOfficialAbilities(): void {
  localStorage.removeItem(KEYS.abilities)
  abilitiesCache = null
}

export function invalidateOfficialAbilitiesCache(): void {
  abilitiesCache = undefined
}

// --- Artifacts ---

export function getOfficialArtifacts(): ArtifactDefinition[] | null {
  return (artifactsCache = readItem<ArtifactDefinition[]>(KEYS.artifacts, artifactsCache))
}

export function setOfficialArtifacts(data: ArtifactDefinition[]): void {
  localStorage.setItem(KEYS.artifacts, JSON.stringify(data))
  artifactsCache = data
}

export function clearOfficialArtifacts(): void {
  localStorage.removeItem(KEYS.artifacts)
  artifactsCache = null
}

export function invalidateOfficialArtifactsCache(): void {
  artifactsCache = undefined
}

// --- Clear all ---

export function clearAllOfficialContent(): void {
  clearOfficialPowers()
  clearOfficialPerks()
  clearOfficialMonsters()
  clearOfficialAbilities()
  clearOfficialArtifacts()
}
