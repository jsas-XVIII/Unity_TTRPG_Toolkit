import type { Perk } from '../types/character'
import type { HomebrewPower } from './powersStorage'
import { getHomebrewPowers, upsertHomebrewPower } from './powersStorage'
import { getHomebrewPerks, upsertHomebrewPerk } from './perksStorage'

export interface ContentPack {
  // Literal 1 (not number) so future schema versions can be narrowed with a discriminated union
  version: 1
  powers: HomebrewPower[]
  perks: Perk[]
}

export interface ImportResult {
  powersCount: number
  perksCount: number
}

export function exportContentPack(): void {
  const pack: ContentPack = {
    version: 1,
    powers: getHomebrewPowers(),
    perks: getHomebrewPerks(),
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

export function importContentPack(json: string): ImportResult {
  const pack = JSON.parse(json) as ContentPack
  // Guard against packs that are missing one key entirely (e.g. a powers-only export from
  // an older version), so we still import whichever half is present.
  const powers: HomebrewPower[] = Array.isArray(pack.powers) ? pack.powers : []
  const perks: Perk[] = Array.isArray(pack.perks) ? pack.perks : []
  // upsert = merge, not replace: existing homebrew entries are preserved; incoming entries
  // with matching IDs override them, and new IDs are appended.
  powers.forEach(upsertHomebrewPower)
  perks.forEach(upsertHomebrewPerk)
  return { powersCount: powers.length, perksCount: perks.length }
}
