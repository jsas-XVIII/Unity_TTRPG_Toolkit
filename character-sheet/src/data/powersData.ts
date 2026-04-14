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

// Pool keys that are never user-selectable — displayed on the sheet as fixed sections.
// Order determines display order on the character sheet.
export const FEATURE_POOL_KEYS = ['baseline', 'lv3', 'lv8', 'lv10'] as const
export type FeaturePoolKey = (typeof FEATURE_POOL_KEYS)[number]

// Display config for every tier value — drives labels in cards and section headings.
export const TIER_CONFIG: Record<
  Power['tier'],
  { label: string; sectionHeading: string; headingColor: string }
> = {
  baseline: { label: 'Baseline', sectionHeading: 'Baseline', headingColor: 'text-sky-600' },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  1: { label: 'T1', sectionHeading: 'Tier I', headingColor: 'text-gray-500' },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  2: { label: 'T2', sectionHeading: 'Tier II', headingColor: 'text-amber-700' },
  lv3: { label: 'Lv3', sectionHeading: 'Level 3', headingColor: 'text-green-700' },
  lv8: { label: 'Lv8', sectionHeading: 'Level 8', headingColor: 'text-purple-700' },
  lv10: { label: 'Lv10', sectionHeading: 'Level 10', headingColor: 'text-rose-700' },
}

// Shape of each class entry in powers.json.
// `classpath` is a legacy key — treated as baseline until the JSON is updated.
type ClassPowerPool = {
  baseline?: Power[]
  classpath?: Power[] // legacy — falls back to baseline
  tier1?: Power[]
  tier2?: Power[]
  lv3?: Power[]
  lv8?: Power[]
  lv10?: Power[]
}

const powersData = powersJson as Record<string, ClassPowerPool>

export interface ResolvedPowerPool {
  baseline: Power[]
  tier1: Power[]
  tier2: Power[]
  lv3: Power[]
  lv8: Power[]
  lv10: Power[]
}

export function getPowersByClass(cls: ClassName): ResolvedPowerPool {
  const e = powersData[cls] ?? {}
  return {
    baseline: e.baseline ?? e.classpath ?? [],
    tier1: e.tier1 ?? [],
    tier2: e.tier2 ?? [],
    lv3: e.lv3 ?? [],
    lv8: e.lv8 ?? [],
    lv10: e.lv10 ?? [],
  }
}

const ALL_POOL_KEYS: (keyof ResolvedPowerPool)[] = [
  'baseline',
  'tier1',
  'tier2',
  'lv3',
  'lv8',
  'lv10',
]

export function getPowerById(id: string): { power: Power; className: ClassName } | undefined {
  for (const cls of CLASS_NAMES) {
    const pools = getPowersByClass(cls)
    for (const key of ALL_POOL_KEYS) {
      const found = pools[key].find((p) => p.id === id)
      if (found) return { power: found, className: cls }
    }
  }
  return undefined
}

export function getAllPowers(): Array<{ power: Power; className: ClassName }> {
  return CLASS_NAMES.flatMap((cls) => {
    const pools = getPowersByClass(cls)
    return ALL_POOL_KEYS.flatMap((key) => pools[key].map((power) => ({ power, className: cls })))
  })
}

// Cumulative token budgets by level (1–10). Index 0 is a safety fallback.
const TOKEN_BUDGET_BY_LEVEL: ReadonlyArray<{ tier1: number; tier2: number }> = [
  { tier1: 0, tier2: 0 }, // index 0 — unused
  { tier1: 3, tier2: 0 }, // Level 1
  { tier1: 4, tier2: 0 }, // Level 2
  { tier1: 4, tier2: 0 }, // Level 3
  { tier1: 5, tier2: 0 }, // Level 4
  { tier1: 6, tier2: 0 }, // Level 5
  { tier1: 6, tier2: 1 }, // Level 6
  { tier1: 7, tier2: 2 }, // Level 7
  { tier1: 8, tier2: 2 }, // Level 8
  { tier1: 8, tier2: 3 }, // Level 9
  { tier1: 9, tier2: 4 }, // Level 10
]

export function getTokenBudget(level: number): { tier1: number; tier2: number } {
  const clamped = Math.max(1, Math.min(10, level))
  return TOKEN_BUDGET_BY_LEVEL[clamped]
}
