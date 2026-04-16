import { useState, useMemo } from 'react'
import type { CharacterPower, Power } from '../../types/character'
import type { ClassName } from '../../data/powersData'
import type { Dispatch } from 'react'
import { getPowersByClass, getPowerById, TIER_CONFIG, getTokenBudget } from '../../data/powersData'
import PowerCard from './PowerCard'
import PowerReferenceCard from './PowerReferenceCard'
import { CARD, SECTION_HEADING } from '../../styles/classes'

// TODO: Baseline powers and powers gained through leveling (lv3, lv8, lv10) should
// eventually be derived automatically from the character's class + level, not stored
// in character.powers. For now, baseline is derived from class data and filtered by
// classPath; lv3/lv8/lv10 will be wired up the same way once level-up is implemented.

type Action =
  | { type: 'ADD_POWER'; power: CharacterPower }
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }
  | { type: 'TOGGLE_FEATURE_UPGRADE'; powerId: string; upgradeId: string }
  | { type: 'TOGGLE_POWER_USED'; id: string }
  | { type: 'FULL_REST' }

interface Props {
  powers: CharacterPower[]
  featureUpgrades?: Record<string, string[]>
  usedPowerIds?: string[]
  className: ClassName
  classPath?: string | null
  level: number
  dispatch: Dispatch<Action>
}

function tokenColor(used: number, total: number): string {
  if (used > total) return 'text-red-400'
  if (used === total) return 'text-green-400'
  return 'text-yellow-400'
}

export default function PowerList({
  powers,
  featureUpgrades = {},
  usedPowerIds = [],
  className,
  classPath,
  level,
  dispatch,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [preview, setPreview] = useState<Power | null>(null)

  const { tier1, tier2, baseline, lv3, lv8, lv10 } = getPowersByClass(className)
  const allClassPowers = [...tier1, ...tier2] // baseline excluded from picker
  const addedIds = useMemo(() => new Set(powers.map((p) => p.id)), [powers])

  // Baseline powers are derived from class data, never stored on the character.
  // Filter to those matching the character's class path (or unrestricted ones).
  const baselinePowers = baseline.filter(
    (p) => !p.restrictToClassPath || p.restrictToClassPath === classPath
  )

  // lv3/lv8/lv10 feature powers — derived, never stored in character.powers.
  // Same path filtering as baseline. Upgrade purchased state comes from featureUpgrades.
  function withFeatureUpgradeState(pool: typeof lv3) {
    return pool
      .filter((p) => !p.restrictToClassPath || p.restrictToClassPath === classPath)
      .map((p) => {
        const purchasedIds = featureUpgrades[p.id] ?? []
        if (purchasedIds.length === 0) return p
        return {
          ...p,
          upgrades: p.upgrades.map((u) => ({ ...u, purchased: purchasedIds.includes(u.id) })),
        }
      })
  }

  const lv3Powers = level >= 3 ? withFeatureUpgradeState(lv3) : []
  const lv8Powers = level >= 8 ? withFeatureUpgradeState(lv8) : []
  const lv10Powers = level >= 10 ? withFeatureUpgradeState(lv10) : []

  const usedSet = useMemo(() => new Set(usedPowerIds), [usedPowerIds])

  // Resolve each power once via getPowerById (O(classes × pools) per call) so we
  // don't repeat the lookup across the three display-group filters below.
  const resolvedPowerMap = useMemo(
    () => new Map(powers.map((p) => [p.id, getPowerById(p.id)])),
    [powers]
  )

  // Resolve tier for display grouping; unresolved powers render in their own fallback card
  const sheetTier1 = powers.filter((p) => resolvedPowerMap.get(p.id)?.power.tier === 1)
  const sheetTier2 = powers.filter((p) => resolvedPowerMap.get(p.id)?.power.tier === 2)
  const sheetUnresolved = powers.filter((p) => !resolvedPowerMap.get(p.id))

  // Token budget for current level
  const budget = getTokenBudget(level)

  // Used tokens — each power costs 1 token (except free_lv5 grants), each purchased
  // upgrade costs 1 additional token of the same tier regardless of power source.
  const tier1Used = sheetTier1.reduce(
    (sum, p) => sum + (p.source !== 'free_lv5' ? 1 : 0) + p.purchasedUpgradeIds.length,
    0
  )
  const tier2Used = sheetTier2.reduce(
    (sum, p) => sum + (p.source !== 'free_lv5' ? 1 : 0) + p.purchasedUpgradeIds.length,
    0
  )
  const freeTier2Count = sheetTier2.filter((p) => p.source === 'free_lv5').length

  // Level 5+ warning: character should have 2 free Tier II powers designated
  const showTier2Warning = level >= 5 && freeTier2Count < 2

  const canUseFreeSlot = level >= 5 && freeTier2Count < 2

  function addPower(source: Power) {
    const powerSource = source.tier === 2 && canUseFreeSlot ? 'free_lv5' : 'purchased'
    dispatch({
      type: 'ADD_POWER',
      power: { id: source.id, purchasedUpgradeIds: [], source: powerSource },
    })
    setPickerOpen(false)
    setPreview(null)
  }

  return (
    <div className={CARD}>
      <h2 className={SECTION_HEADING}>Powers</h2>

      {/* Token counters + Full Rest */}
      <div className="flex flex-wrap gap-4 mb-4 px-1 items-center">
        <span className="text-xs text-gray-500">
          Tier I Tokens:{' '}
          <span className={tokenColor(tier1Used, budget.tier1)}>
            {tier1Used}/{budget.tier1}
          </span>
        </span>
        <span className="text-xs text-gray-500">
          Tier II Tokens:{' '}
          <span className={tokenColor(tier2Used, budget.tier2)}>
            {tier2Used}/{budget.tier2}
          </span>
        </span>
        {level >= 5 && (
          <span className="text-xs text-gray-500">
            Free Tier II:{' '}
            <span className={freeTier2Count >= 2 ? 'text-green-400' : 'text-yellow-400'}>
              {freeTier2Count}/2
            </span>
          </span>
        )}
        {usedPowerIds.length > 0 && (
          <button
            className="ml-auto text-xs px-2 py-0.5 rounded border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition-colors"
            onClick={() => dispatch({ type: 'FULL_REST' })}
          >
            Full Rest
          </button>
        )}
      </div>

      {/* Level 5 warning */}
      {showTier2Warning && (
        <p className="text-xs text-yellow-500 mb-3">
          Level 5 grants 2 free Tier II powers — designate them when adding via the picker.
        </p>
      )}

      {/* Baseline — derived from class data, read-only */}
      {baselinePowers.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs ${TIER_CONFIG.baseline.headingColor} uppercase mb-2`}>
            {TIER_CONFIG.baseline.sectionHeading}
          </p>
          <div className="flex flex-wrap gap-3">
            {baselinePowers.map((p) => (
              <PowerReferenceCard
                key={p.id}
                power={p}
                className={className}
                isUsed={
                  p.actionType === 'Overdrive' || p.actionType === 'Ultimate'
                    ? usedSet.has(p.id)
                    : undefined
                }
                onToggleUsed={
                  p.actionType === 'Overdrive' || p.actionType === 'Ultimate'
                    ? () => dispatch({ type: 'TOGGLE_POWER_USED', id: p.id })
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Level feature sections — derived, read-only except for upgrade toggles */}
      {(
        [
          { key: 'lv3', pool: lv3Powers },
          { key: 'lv8', pool: lv8Powers },
          { key: 'lv10', pool: lv10Powers },
        ] as const
      ).map(({ key, pool }) =>
        pool.length > 0 ? (
          <div key={key} className="mb-4">
            <p className={`text-xs ${TIER_CONFIG[key].headingColor} uppercase mb-2`}>
              {TIER_CONFIG[key].sectionHeading}
            </p>
            <div className="flex flex-wrap gap-3">
              {pool.map((p) => (
                <PowerReferenceCard
                  key={p.id}
                  power={p}
                  className={className}
                  onUpgradeToggle={
                    p.upgrades.length > 0
                      ? (upgradeId) =>
                          dispatch({ type: 'TOGGLE_FEATURE_UPGRADE', powerId: p.id, upgradeId })
                      : undefined
                  }
                  isUsed={
                    p.actionType === 'Overdrive' || p.actionType === 'Ultimate'
                      ? usedSet.has(p.id)
                      : undefined
                  }
                  onToggleUsed={
                    p.actionType === 'Overdrive' || p.actionType === 'Ultimate'
                      ? () => dispatch({ type: 'TOGGLE_POWER_USED', id: p.id })
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : null
      )}

      {sheetTier1.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Tier I</p>
          <div className="flex flex-wrap gap-3">
            {sheetTier1.map((p) => (
              <PowerCard
                key={p.id}
                power={p}
                className={className}
                usedPowerIds={usedSet}
                dispatch={dispatch}
              />
            ))}
          </div>
        </div>
      )}

      {sheetTier2.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-amber-700 uppercase mb-2">Tier II</p>
          <div className="flex flex-wrap gap-3">
            {sheetTier2.map((p) => (
              <PowerCard
                key={p.id}
                power={p}
                className={className}
                usedPowerIds={usedSet}
                dispatch={dispatch}
              />
            ))}
          </div>
        </div>
      )}

      {sheetUnresolved.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-red-700 uppercase mb-2">Unknown</p>
          <div className="flex flex-wrap gap-3">
            {sheetUnresolved.map((p) => (
              <PowerCard key={p.id} power={p} className={className} dispatch={dispatch} />
            ))}
          </div>
        </div>
      )}

      {!pickerOpen && (
        <button
          className="w-full py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm transition-colors mt-2"
          onClick={() => setPickerOpen(true)}
        >
          + Add Power
        </button>
      )}

      {pickerOpen && (
        <div className="mt-3 border border-gray-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {className} Powers
            </span>
            <button
              className="text-gray-500 hover:text-gray-300 text-xs"
              onClick={() => {
                setPickerOpen(false)
                setPreview(null)
              }}
            >
              Cancel
            </button>
          </div>

          <div className="flex">
            {/* Power list */}
            <div className="w-48 shrink-0 border-r border-gray-700 overflow-y-auto max-h-80">
              {allClassPowers.map((p) => {
                const already = addedIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    disabled={already}
                    onClick={() => (already ? undefined : setPreview(p))}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-gray-800 flex items-center gap-2 transition-colors
                      ${preview?.id === p.id ? 'bg-gray-700' : 'hover:bg-gray-750'}
                      ${already ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                  >
                    <span className="shrink-0 text-[9px] font-bold px-1 py-0.5 rounded bg-gray-700 text-gray-400">
                      {TIER_CONFIG[p.tier].label}
                    </span>
                    <span className={already ? 'text-gray-500' : 'text-gray-200'}>{p.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Preview + add */}
            <div className="flex-1 p-3 flex flex-col items-center gap-3 bg-gray-850 min-h-[10rem]">
              {preview ? (
                <>
                  <PowerReferenceCard power={preview} className={className} />

                  <button
                    className="px-4 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold"
                    onClick={() => addPower(preview)}
                  >
                    Add to Sheet
                  </button>
                </>
              ) : (
                <p className="text-xs text-gray-600 mt-6">Select a power to preview it</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
