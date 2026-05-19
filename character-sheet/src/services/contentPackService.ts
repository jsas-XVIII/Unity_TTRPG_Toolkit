import type { Perk } from '../types/character'
import type { HomebrewPower } from './powersStorage'
import type { ArtifactDefinition } from '../types/artifact'
import { getHomebrewPowers } from './powersStorage'
import { getHomebrewPerks } from './perksStorage'
import { getHomebrewArtifacts } from './artifactsStorage'

export interface ContentPack {
  // Literal 1 (not number) so future schema versions can be narrowed with a discriminated union
  version: 1
  powers: HomebrewPower[]
  perks: Perk[]
  artifacts: ArtifactDefinition[]
}

export interface ImportResult {
  powersCount: number
  perksCount: number
  artifactsCount: number
}

export function exportContentPack(): void {
  const pack: ContentPack = {
    version: 1,
    powers: getHomebrewPowers(),
    perks: getHomebrewPerks(),
    artifacts: getHomebrewArtifacts(),
  }
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'unity-content-pack.json'
  a.click()
  // Release the object URL immediately after the click — the browser only needs it long
  // enough to start the download, and holding it leaks memory until the page is unloaded.
  URL.revokeObjectURL(url)
}

// Pure parser — validates the pack JSON and returns the arrays. Persisting them is the
// caller's job, since the player-side import flow needs to update HomebrewContext too,
// which can only happen from inside React. See HomeScreen.handleContentPackFile.
export function parseContentPack(json: string): {
  powers: HomebrewPower[]
  perks: Perk[]
  artifacts: ArtifactDefinition[]
} {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new Error('Content pack is not valid JSON')
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Content pack must be a JSON object')
  }

  const pack = raw as Record<string, unknown>

  if (pack.version !== 1) {
    throw new Error('Unsupported content pack version')
  }

  // Guard against packs that are missing one key entirely (e.g. a powers-only export from
  // an older version), so we still import whichever half is present.
  const powers: HomebrewPower[] = Array.isArray(pack.powers) ? (pack.powers as HomebrewPower[]) : []
  const perks: Perk[] = Array.isArray(pack.perks) ? (pack.perks as Perk[]) : []
  const artifacts: ArtifactDefinition[] = Array.isArray(pack.artifacts)
    ? (pack.artifacts as ArtifactDefinition[])
    : []
  return { powers, perks, artifacts }
}
