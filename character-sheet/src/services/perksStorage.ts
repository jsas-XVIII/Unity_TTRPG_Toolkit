import type { Perk } from '../types/character'

const KEY = 'unity_ttrpg_homebrew_perks'

let cache: Perk[] | null = null

export function invalidatePerksCache(): void {
  cache = null
}

export function getHomebrewPerks(): Perk[] {
  if (cache !== null) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Perk[]
  } catch {
    // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
    cache = []
  }
  return cache
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function save(perks: Perk[]): void {
  localStorage.setItem(KEY, JSON.stringify(perks))
  cache = perks
}

export function replaceHomebrewPerks(perks: Perk[]): void {
  save(perks)
}

export function upsertHomebrewPerk(perk: Perk): void {
  const existing = getHomebrewPerks()
  const idx = existing.findIndex((p) => p.id === perk.id)
  if (idx >= 0) {
    existing[idx] = perk
  } else {
    existing.push(perk)
  }
  try {
    save(existing)
  } catch (e) {
    // save() mutates cache before the localStorage write, so reset on failure
    // to keep cache consistent with what's actually persisted.
    cache = null
    throw e
  }
}

export function deleteHomebrewPerk(id: string): void {
  save(getHomebrewPerks().filter((p) => p.id !== id))
}
