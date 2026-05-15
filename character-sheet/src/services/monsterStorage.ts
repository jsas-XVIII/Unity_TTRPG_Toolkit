import type { Monster, MonsterAbility } from '../types/monster'

const MONSTERS_KEY = 'unity_ttrpg_monsters'
const ABILITIES_KEY = 'unity_ttrpg_monster_abilities'

let monstersCache: Monster[] | null = null
let abilitiesCache: MonsterAbility[] | null = null

export function invalidateMonsterCache(): void {
  monstersCache = null
  abilitiesCache = null
}

function readJson<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

export function getHomebrewMonsters(): Monster[] {
  if (monstersCache !== null) return monstersCache
  monstersCache = readJson<Monster>(MONSTERS_KEY)
  return monstersCache
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveMonsters(monsters: Monster[]): void {
  localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters))
  monstersCache = monsters
}

export function replaceHomebrewMonsters(monsters: Monster[]): void {
  saveMonsters(monsters)
}

export function addHomebrewMonster(monster: Monster): void {
  saveMonsters([...getHomebrewMonsters(), monster])
}

export function updateHomebrewMonster(monster: Monster): void {
  saveMonsters(getHomebrewMonsters().map((m) => (m.id === monster.id ? monster : m)))
}

export function deleteHomebrewMonster(id: string): void {
  saveMonsters(getHomebrewMonsters().filter((m) => m.id !== id))
}

export function isHomebrew(id: string): boolean {
  return getHomebrewMonsters().some((m) => m.id === id)
}

export function getHomebrewAbilities(): MonsterAbility[] {
  if (abilitiesCache !== null) return abilitiesCache
  abilitiesCache = readJson<MonsterAbility>(ABILITIES_KEY)
  return abilitiesCache
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveAbilities(abilities: MonsterAbility[]): void {
  localStorage.setItem(ABILITIES_KEY, JSON.stringify(abilities))
  abilitiesCache = abilities
}

export function replaceHomebrewAbilities(abilities: MonsterAbility[]): void {
  saveAbilities(abilities)
}

export function addHomebrewAbility(ability: MonsterAbility): void {
  saveAbilities([...getHomebrewAbilities(), ability])
}
