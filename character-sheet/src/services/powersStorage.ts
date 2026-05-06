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
// Every write produces a fresh array reference (cache is replaced, never mutated in place),
// so React state mirrors of getHomebrewPowers() can rely on identity-based change detection.
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
  const next = idx >= 0 ? existing.map((p, i) => (i === idx ? power : p)) : [...existing, power]
  save(next)
}

export function deleteHomebrewPower(id: string): void {
  save(getHomebrewPowers().filter((p) => p.id !== id))
}
