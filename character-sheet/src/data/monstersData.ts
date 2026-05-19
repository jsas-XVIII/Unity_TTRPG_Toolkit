import type { Monster, MonsterAbility, MonsterTemplate } from '../types/monster'
import monstersJson from './monsters.json'
import abilitiesJson from './monster-abilities.json'
import templatesJson from './monster-templates.json'
import { getHomebrewMonsters, getHomebrewAbilities } from '../services/monsterStorage'
import {
  getOfficialMonsters as getOfficialMonstersFromStorage,
  getOfficialAbilities as getOfficialAbilitiesFromStorage,
} from '../services/officialContentStorage'
import { mergeOfficial } from '../utils/mergeOfficial'

const staticMonsters = monstersJson as Monster[]
const staticAbilities = abilitiesJson as MonsterAbility[]
const staticTemplates = templatesJson as MonsterTemplate[]

const staticMonsterIds = new Set(staticMonsters.map((m) => m.id))
const staticAbilityIds = new Set(staticAbilities.map((a) => a.id))

export function isStaticMonster(id: string): boolean {
  return staticMonsterIds.has(id)
}

export function isStaticAbility(id: string): boolean {
  return staticAbilityIds.has(id)
}

export function getAllMonsters(): Monster[] {
  return mergeOfficial(
    mergeOfficial(staticMonsters, getOfficialMonstersFromStorage() ?? []),
    getHomebrewMonsters()
  )
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
  return mergeOfficial(
    mergeOfficial(staticAbilities, getOfficialAbilitiesFromStorage() ?? []),
    getHomebrewAbilities()
  )
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

export function getAllTemplates(): MonsterTemplate[] {
  return staticTemplates
}

export function applyTemplates(monster: Monster, templates: MonsterTemplate[]): Monster {
  if (templates.length === 0) return monster
  const addTraitIds = new Set(monster.traitIds)
  const addPowerIds = new Set(monster.powerIds)
  let hpDelta = 0,
    arDelta = 0,
    drDelta = 0,
    mrDelta = 0,
    avDelta = 0,
    spdDelta = 0
  let mightDelta = 0,
    agilityDelta = 0,
    mindDelta = 0,
    presenceDelta = 0
  for (const t of templates) {
    hpDelta += t.hpDelta
    arDelta += t.arDelta
    drDelta += t.drDelta
    mrDelta += t.mrDelta
    avDelta += t.avDelta
    spdDelta += t.spdDelta
    mightDelta += t.mightDelta
    agilityDelta += t.agilityDelta
    mindDelta += t.mindDelta
    presenceDelta += t.presenceDelta
    t.addTraitIds.forEach((id) => addTraitIds.add(id))
    t.removeTraitIds.forEach((id) => addTraitIds.delete(id))
    t.addPowerIds.forEach((id) => addPowerIds.add(id))
    t.removePowerIds.forEach((id) => addPowerIds.delete(id))
  }
  return {
    ...monster,
    hp: monster.hp + hpDelta,
    ar: monster.ar + arDelta,
    dr: monster.dr + drDelta,
    mr: monster.mr + mrDelta,
    av: monster.av + avDelta,
    spd: monster.spd + spdDelta,
    might: monster.might + mightDelta,
    agility: monster.agility + agilityDelta,
    mind: monster.mind + mindDelta,
    presence: monster.presence + presenceDelta,
    traitIds: [...addTraitIds],
    powerIds: [...addPowerIds],
  }
}
