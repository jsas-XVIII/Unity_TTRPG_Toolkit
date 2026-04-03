import type { Power, ClassName } from '../types/character'
import powersJson from './powers.json'

export type { ClassName }

export const CLASS_NAMES: ClassName[] = [
  'Dreadnought',
  'Driftwalker',
  'Fell Hunter',
  'Judge',
  'Mystic',
  'Phantom',
  'Priest',
  'Primalist',
  'Sentinel',
]

type PowersData = Record<string, { tier1: Power[]; tier2: Power[] }>
const powersData = powersJson as PowersData

export function getPowersByClass(cls: ClassName): { tier1: Power[]; tier2: Power[] } {
  return powersData[cls] ?? { tier1: [], tier2: [] }
}

export function getPowerById(id: string): { power: Power; className: ClassName } | undefined {
  for (const cls of CLASS_NAMES) {
    const { tier1, tier2 } = powersData[cls]
    const found = [...tier1, ...tier2].find((p) => p.id === id)
    if (found) return { power: found, className: cls }
  }
  return undefined
}

export function getAllPowers(): Array<{ power: Power; className: ClassName }> {
  return CLASS_NAMES.flatMap((cls) => {
    const { tier1, tier2 } = powersData[cls]
    return [...tier1, ...tier2].map((power) => ({ power, className: cls }))
  })
}
