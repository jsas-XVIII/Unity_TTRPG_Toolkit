import type { Power, ClassName } from '../types/character'

export interface HomebrewPower extends Power {
  className: ClassName
}

const KEY = 'unity_ttrpg_homebrew_powers'

export function getHomebrewPowers(): HomebrewPower[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as HomebrewPower[]
  } catch {
    // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
    return []
  }
}

function save(powers: HomebrewPower[]): void {
  localStorage.setItem(KEY, JSON.stringify(powers))
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
  save(existing)
}

export function deleteHomebrewPower(id: string): void {
  save(getHomebrewPowers().filter((p) => p.id !== id))
}
