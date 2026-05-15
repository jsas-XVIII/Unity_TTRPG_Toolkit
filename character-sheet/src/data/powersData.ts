import type { Power, ClassName } from '../types/character'
import powersJson from './powers.json'
import { getHomebrewPowers, type HomebrewPower } from '../services/powersStorage'
import { getOfficialPowers } from '../services/officialContentStorage'
import { mergeOfficial } from '../utils/mergeOfficial'
export type { HomebrewPower } from '../services/powersStorage'

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
  { label: string; sectionHeading: string; headingColor: string; badgeColor: string }
> = {
  baseline: {
    label: 'Baseline',
    sectionHeading: 'Baseline',
    headingColor: 'text-sky-600',
    badgeColor: 'bg-sky-900 text-sky-300',
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  1: {
    label: 'T1',
    sectionHeading: 'Tier I',
    headingColor: 'text-gray-500',
    badgeColor: 'bg-gray-700 text-gray-300',
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  2: {
    label: 'T2',
    sectionHeading: 'Tier II',
    headingColor: 'text-amber-700',
    badgeColor: 'bg-amber-900 text-amber-300',
  },
  lv3: {
    label: 'Lv3',
    sectionHeading: 'Level 3',
    headingColor: 'text-green-700',
    badgeColor: 'bg-green-900 text-green-300',
  },
  lv8: {
    label: 'Lv8',
    sectionHeading: 'Level 8',
    headingColor: 'text-purple-700',
    badgeColor: 'bg-purple-900 text-purple-300',
  },
  lv10: {
    label: 'Lv10',
    sectionHeading: 'Level 10',
    headingColor: 'text-rose-700',
    badgeColor: 'bg-rose-900 text-rose-300',
  },
}

// Shape of each class entry in powers.json.
// `classpath` is a legacy key — treated as baseline until the JSON is updated.
export type ClassPowerPool = {
  baseline?: Power[]
  classpath?: Power[] // legacy — falls back to baseline
  tier1?: Power[]
  tier2?: Power[]
  lv3?: Power[]
  lv8?: Power[]
  lv10?: Power[]
}

const powersData = powersJson as Record<string, ClassPowerPool>

// Built once at module load — O(1) lookups for isOfficialPower() instead of scanning all JSON per call.
const officialPowerIds = new Set<string>(
  CLASS_NAMES.flatMap((cls) => {
    const e = powersData[cls] ?? {}
    return [
      ...(e.baseline ?? e.classpath ?? []),
      ...(e.tier1 ?? []),
      ...(e.tier2 ?? []),
      ...(e.lv3 ?? []),
      ...(e.lv8 ?? []),
      ...(e.lv10 ?? []),
    ].map((p) => p.id)
  })
)

export interface ResolvedPowerPool {
  baseline: Power[]
  tier1: Power[]
  tier2: Power[]
  lv3: Power[]
  lv8: Power[]
  lv10: Power[]
}

// homebrew is pre-filtered to this class — caller reads localStorage once and passes it in
function mergeHomebrew(base: Power[], homebrew: HomebrewPower[], tier: Power['tier']): Power[] {
  return mergeOfficial(
    base,
    homebrew.filter((p) => p.tier === tier)
  )
}

export function getPowersByClass(cls: ClassName): ResolvedPowerPool {
  const demo = powersData[cls] ?? {}
  const official = getOfficialPowers()?.[cls] ?? null
  const homebrew = getHomebrewPowers().filter((p) => p.className === cls)

  function resolvePool(demoPool: Power[], tier: Power['tier']): Power[] {
    const withOfficial = official
      ? mergeOfficial(demoPool, (official as ClassPowerPool)[poolKeyForTier(tier)] ?? [])
      : demoPool
    return mergeHomebrew(withOfficial, homebrew, tier)
  }

  return {
    baseline: resolvePool(demo.baseline ?? demo.classpath ?? [], 'baseline'),
    tier1: resolvePool(demo.tier1 ?? [], 1),
    tier2: resolvePool(demo.tier2 ?? [], 2),
    lv3: resolvePool(demo.lv3 ?? [], 'lv3'),
    lv8: resolvePool(demo.lv8 ?? [], 'lv8'),
    lv10: resolvePool(demo.lv10 ?? [], 'lv10'),
  }
}

function poolKeyForTier(tier: Power['tier']): keyof ClassPowerPool {
  if (tier === 'baseline') return 'baseline'
  if (tier === 1) return 'tier1'
  if (tier === 2) return 'tier2'
  if (tier === 'lv3') return 'lv3'
  if (tier === 'lv8') return 'lv8'
  return 'lv10'
}

export function isOfficialPower(id: string): boolean {
  return officialPowerIds.has(id)
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
