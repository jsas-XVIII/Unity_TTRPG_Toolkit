import type { Monster, MonsterAbility } from '../types/monster'
import monstersJson from './monsters.json'
import abilitiesJson from './monster-abilities.json'

const monstersData = monstersJson as Monster[]
const abilitiesData = abilitiesJson as MonsterAbility[]

export function getAllMonsters(): Monster[] {
  return monstersData
}

export function getMonsterById(id: string): Monster | undefined {
  return monstersData.find((m) => m.id === id)
}

export function getMonstersByFaction(faction: string): Monster[] {
  return monstersData.filter((m) => m.faction === faction)
}

export function getMonstersByDangerLevel(dl: number): Monster[] {
  return monstersData.filter((m) => m.dangerLevel === dl)
}

export function getFactions(): string[] {
  return [...new Set(monstersData.map((m) => m.faction).filter((f): f is string => f !== null))]
}

export function getAllAbilities(): MonsterAbility[] {
  return abilitiesData
}

export function getAbilityById(id: string): MonsterAbility | undefined {
  return abilitiesData.find((a) => a.id === id)
}

export function resolveTraits(monster: Monster): MonsterAbility[] {
  return monster.traitIds
    .map((id) => getAbilityById(id))
    .filter((a): a is MonsterAbility => a !== undefined)
}

export function resolvePowers(monster: Monster): MonsterAbility[] {
  return monster.powerIds
    .map((id) => getAbilityById(id))
    .filter((a): a is MonsterAbility => a !== undefined)
}
