import type { Power, ClassName } from '../types/character'

export interface HomebrewPower extends Power {
  className: ClassName
}

const KEY = 'unity_ttrpg_homebrew_powers'

let cache: HomebrewPower[] | null = null

export function invalidatePowerCache(): void {
  cache = null
}

export function getHomebrewPowers(): HomebrewPower[] {
  if (cache !== null) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') as HomebrewPower[]
  } catch {
    // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
    cache = []
  }
  return cache
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
function save(powers: HomebrewPower[]): void {
  localStorage.setItem(KEY, JSON.stringify(powers))
  cache = powers
}

export function replaceHomebrewPowers(powers: HomebrewPower[]): void {
  save(powers)
}

export function upsertHomebrewPower(power: HomebrewPower): void {
  const existing = getHomebrewPowers()
  const idx = existing.findIndex((p) => p.id === power.id)
  if (idx >= 0) {
    existing[idx] = power
  } else {
    existing.push(power)
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

export function deleteHomebrewPower(id: string): void {
  save(getHomebrewPowers().filter((p) => p.id !== id))
}
