import type { Perk } from '../types/character'

const KEY = 'unity_ttrpg_homebrew_perks'

export function getHomebrewPerks(): Perk[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Perk[]
  } catch {
    // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
    return []
  }
}

function save(perks: Perk[]): void {
  localStorage.setItem(KEY, JSON.stringify(perks))
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
  save(existing)
}

export function deleteHomebrewPerk(id: string): void {
  save(getHomebrewPerks().filter((p) => p.id !== id))
}
