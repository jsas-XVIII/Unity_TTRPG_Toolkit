import type { Perk } from '../types/character'
import type { Monster, MonsterAbility } from '../types/monster'
import type { ArtifactDefinition } from '../types/artifact'
import type { ClassPowerPool } from '../data/powersData'

export interface OfficialContentBundle {
  powers: Record<string, ClassPowerPool>
  perks: Perk[]
  monsters: Monster[]
  monsterAbilities: MonsterAbility[]
  artifacts: ArtifactDefinition[]
}

export interface OfficialImportResult {
  powersClassCount: number
  perksCount: number
  monstersCount: number
  abilitiesCount: number
  artifactsCount: number
}

export function parseOfficialBundle(json: string): OfficialContentBundle {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Official content file is not valid JSON')
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Official content file must be a JSON object')
  }

  const obj = raw as Record<string, unknown>

  if (obj.version !== 1) {
    throw new Error('Unsupported official content version')
  }

  if (obj.type !== 'official') {
    throw new Error('File is not an official content bundle')
  }

  const powers =
    obj.powers && typeof obj.powers === 'object' && !Array.isArray(obj.powers)
      ? (obj.powers as Record<string, ClassPowerPool>)
      : {}
  const perks = Array.isArray(obj.perks) ? (obj.perks as Perk[]) : []
  const monsters = Array.isArray(obj.monsters) ? (obj.monsters as Monster[]) : []
  const monsterAbilities = Array.isArray(obj.monsterAbilities)
    ? (obj.monsterAbilities as MonsterAbility[])
    : []
  const artifacts = Array.isArray(obj.artifacts) ? (obj.artifacts as ArtifactDefinition[]) : []

  return { powers, perks, monsters, monsterAbilities, artifacts }
}

export function officialImportResult(bundle: OfficialContentBundle): OfficialImportResult {
  return {
    powersClassCount: Object.keys(bundle.powers).length,
    perksCount: bundle.perks.length,
    monstersCount: bundle.monsters.length,
    abilitiesCount: bundle.monsterAbilities.length,
    artifactsCount: bundle.artifacts.length,
  }
}
