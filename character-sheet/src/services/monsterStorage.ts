import type { Monster, MonsterAbility } from '../types/monster'

const MONSTERS_KEY = 'unity_ttrpg_monsters'
const ABILITIES_KEY = 'unity_ttrpg_monster_abilities'

function readJson<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
  } catch {
    return []
  }
}

export function getHomebrewMonsters(): Monster[] {
  return readJson<Monster>(MONSTERS_KEY)
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveMonsters(monsters: Monster[]): void {
  localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters))
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
  return readJson<MonsterAbility>(ABILITIES_KEY)
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function saveAbilities(abilities: MonsterAbility[]): void {
  localStorage.setItem(ABILITIES_KEY, JSON.stringify(abilities))
}

export function addHomebrewAbility(ability: MonsterAbility): void {
  saveAbilities([...getHomebrewAbilities(), ability])
}
