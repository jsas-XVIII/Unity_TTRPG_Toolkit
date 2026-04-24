import type { Monster, MonsterAbility } from '../types/monster'
import monstersJson from './monsters.json'
import abilitiesJson from './monster-abilities.json'
import { getHomebrewMonsters, getHomebrewAbilities } from '../services/monsterStorage'

const staticMonsters = monstersJson as Monster[]
const staticAbilities = abilitiesJson as MonsterAbility[]

export function getAllMonsters(): Monster[] {
  return [...staticMonsters, ...getHomebrewMonsters()]
}

export function getMonsterById(id: string): Monster | undefined {
  return getAllMonsters().find((m) => m.id === id)
}

export function getMonstersByFaction(faction: string): Monster[] {
  return getAllMonsters().filter((m) => m.faction === faction)
}

export function getMonstersByDangerLevel(dl: number): Monster[] {
  return getAllMonsters().filter((m) => m.dangerLevel === dl)
}

export function getFactions(): string[] {
  return [
    ...new Set(
      getAllMonsters()
        .map((m) => m.faction)
        .filter((f): f is string => f !== null)
    ),
  ]
}

export function getAllAbilities(): MonsterAbility[] {
  return [...staticAbilities, ...getHomebrewAbilities()]
}

export function getAbilityById(id: string): MonsterAbility | undefined {
  return getAllAbilities().find((a) => a.id === id)
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
