import type { Perk } from '../types/character'
import perksJson from './perks.json'
import { getHomebrewPerks } from '../services/perksStorage'
import { getOfficialPerks as getOfficialPerksFromStorage } from '../services/officialContentStorage'
import { mergeOfficial } from '../utils/mergeOfficial'

const staticPerks = perksJson as Perk[]

export function getAllPerks(): Perk[] {
  const withOfficial = mergeOfficial(staticPerks, getOfficialPerksFromStorage() ?? [])
  return mergeOfficial(withOfficial, getHomebrewPerks())
}

export function getOfficialPerks(): Perk[] {
  return staticPerks
}

export function getPerkById(id: string): Perk | undefined {
  return getAllPerks().find((p) => p.id === id)
}

export function getPerkByName(name: string): Perk | undefined {
  return getAllPerks().find((p) => p.name === name)
}

export function isOfficialPerk(id: string): boolean {
  return staticPerks.some((p) => p.id === id)
}
