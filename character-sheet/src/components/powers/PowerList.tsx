import { useState } from 'react'
import type { CharacterPower, Power } from '../../types/character'
import type { ClassName } from '../../data/powersData'
import type { Dispatch } from 'react'
import { getPowersByClass, getPowerById, TIER_CONFIG } from '../../data/powersData'
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

interface Props {
  powers: CharacterPower[]
  className: ClassName
  classPath?: string | null
  dispatch: Dispatch<Action>
}

export default function PowerList({ powers, className, classPath, dispatch }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [preview, setPreview] = useState<Power | null>(null)

  const { tier1, tier2, baseline } = getPowersByClass(className)
  const allClassPowers = [...tier1, ...tier2] // baseline excluded from picker
  const addedIds = new Set(powers.map((p) => p.id))

  // Baseline powers are derived from class data, never stored on the character.
  // Filter to those matching the character's class path (or unrestricted ones).
  const baselinePowers = baseline.filter(
    (p) => !p.restrictToClassPath || p.restrictToClassPath === classPath
  )

  function addPower(source: Power) {
    dispatch({ type: 'ADD_POWER', power: { id: source.id, purchasedUpgradeIds: [] } })
    setPickerOpen(false)
    setPreview(null)
  }

  // Resolve tier for display grouping; unresolved powers render in their own fallback card
  const sheetTier1 = powers.filter((p) => getPowerById(p.id)?.power.tier === 1)
  const sheetTier2 = powers.filter((p) => getPowerById(p.id)?.power.tier === 2)
  const sheetUnresolved = powers.filter((p) => !getPowerById(p.id))

  return (
    <div className={CARD}>
      <h2 className={SECTION_HEADING}>Powers</h2>

      {/* Baseline — derived from class data, read-only */}
      {baselinePowers.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs ${TIER_CONFIG.baseline.headingColor} uppercase mb-2`}>
            {TIER_CONFIG.baseline.sectionHeading}
          </p>
          <div className="flex flex-wrap gap-3">
            {baselinePowers.map((p) => (
              <PowerReferenceCard key={p.id} power={p} className={className} />
            ))}
          </div>
        </div>
      )}

      {sheetTier1.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Tier I</p>
          <div className="flex flex-wrap gap-3">
            {sheetTier1.map((p) => (
              <PowerCard key={p.id} power={p} className={className} dispatch={dispatch} />
            ))}
          </div>
        </div>
      )}

      {sheetTier2.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-amber-700 uppercase mb-2">Tier II</p>
          <div className="flex flex-wrap gap-3">
            {sheetTier2.map((p) => (
              <PowerCard key={p.id} power={p} className={className} dispatch={dispatch} />
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
