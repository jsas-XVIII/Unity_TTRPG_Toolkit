import { useState, useMemo } from 'react'
import StorageErrorToast from '../../ui/StorageErrorToast'
import { isQuotaError } from '../../../utils/storageErrors'
import type { Power, ClassName } from '../../../types/character'
import type { HomebrewPower } from '../../../services/powersStorage'
import {
  CLASS_NAMES,
  getPowersByClass,
  isOfficialPower,
  TIER_CONFIG,
  type ResolvedPowerPool,
} from '../../../data/powersData'
import { useHomebrew } from '../../../context/HomebrewContext'
import PowerEditorForm from './PowerEditorForm'
import { uid } from '../../../utils/idGenerator'

interface Props {
  onBack: () => void
}

type TierFilter = 'all' | keyof ResolvedPowerPool

const TIER_LABELS: Record<keyof ResolvedPowerPool, string> = {
  baseline: 'Baseline',
  tier1: 'Tier I',
  tier2: 'Tier II',
  lv3: 'Lv 3',
  lv8: 'Lv 8',
  lv10: 'Lv 10',
}

export default function PowersPanel({ onBack }: Props) {
  const [selectedClass, setSelectedClass] = useState<ClassName>('Dreadnought')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ power: HomebrewPower; readOnly: boolean } | null>(null)
  const [storageError, setStorageError] = useState(false)
  const { powers: homebrewPowers, upsertPower, deletePower } = useHomebrew()

  const homebrewIds = useMemo(() => new Set(homebrewPowers.map((p) => p.id)), [homebrewPowers])

  const allPowers = useMemo(() => {
    const pools = getPowersByClass(selectedClass)
    const keys = (
      tierFilter === 'all'
        ? (['baseline', 'tier1', 'tier2', 'lv3', 'lv8', 'lv10'] as const)
        : [tierFilter]
    ) as (keyof ResolvedPowerPool)[]
    return keys.flatMap((key) => pools[key].map((power) => ({ power, poolKey: key })))
    // homebrewPowers identity changes on every mutation, replacing the old refreshKey memo dep.
  }, [selectedClass, tierFilter, homebrewPowers])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term ? allPowers.filter((p) => p.power.name.toLowerCase().includes(term)) : allPowers
  }, [allPowers, search])

  // If the power has a homebrew override, edit that version — not the official one.
  // Falls back to a shaped copy of the official Power with className injected.
  function resolvePower(power: Power): HomebrewPower {
    return homebrewPowers.find((p) => p.id === power.id) ?? { ...power, className: selectedClass }
  }

  function startView(power: Power) {
    setEditing({ power: resolvePower(power), readOnly: true })
  }

  function startEdit(power: Power) {
    setEditing({ power: resolvePower(power), readOnly: false })
  }

  function startNew() {
    setEditing({
      power: {
        id: `hb-power-${uid()}`,
        name: '',
        className: selectedClass,
        tier: 1,
        actionType: 'Standard',
        cost: '',
        target: 'Single',
        range: 'Nearby',
        effectsText: '',
        upgrades: [],
      },
      readOnly: false,
    })
  }

  function handleSave(power: HomebrewPower) {
    try {
      upsertPower(power)
      setEditing(null)
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  function handleReset(id: string) {
    deletePower(id)
    setEditing(null)
  }

  function handleDelete(id: string) {
    deletePower(id)
    setEditing(null)
  }

  if (editing) {
    const { power, readOnly } = editing
    const official = isOfficialPower(power.id)
    const overridden = official && homebrewIds.has(power.id)
    return (
      <>
        {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
        <PowerEditorForm
          initial={power}
          isOfficial={official}
          isOverridden={overridden}
          readOnly={readOnly}
          onSave={handleSave}
          onReset={overridden ? () => handleReset(power.id) : undefined}
          onDelete={!official ? () => handleDelete(power.id) : undefined}
          onCancel={() => setEditing(null)}
        />
      </>
    )
  }

  return (
    <>
      {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-100">Powers Editor</h1>
          <span className="text-xs text-gray-500">{filtered.length} powers</span>
          <div className="ml-auto">
            <button
              onClick={startNew}
              className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
            >
              + New Power
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Class selector */}
          <div className="flex flex-wrap gap-1.5">
            {CLASS_NAMES.map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedClass === cls
                    ? 'bg-amber-700 border-amber-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Tier filter + search */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex rounded overflow-hidden border border-gray-700">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  tierFilter === 'all'
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {(Object.keys(TIER_LABELS) as (keyof ResolvedPowerPool)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTierFilter(key)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    tierFilter === key
                      ? 'bg-amber-700 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {TIER_LABELS[key]}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search powers…"
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500 flex-1 min-w-32"
            />
          </div>
        </div>

        {/* Power list */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No powers match.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(({ power }) => {
              // official=true  + overridden=false → official, untouched
              // official=true  + overridden=true  → official entry shadowed by homebrew override
              // official=false + homebrewOnly=true → net-new homebrew (no official equivalent)
              const official = isOfficialPower(power.id)
              const overridden = official && homebrewIds.has(power.id)
              const homebrewOnly = !official

              return (
                <div
                  key={power.id}
                  className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${TIER_CONFIG[power.tier].badgeColor}`}
                      >
                        {TIER_CONFIG[power.tier].label}
                      </span>
                      <span className="font-semibold text-gray-100">{power.name}</span>
                      <span className="text-xs text-gray-500 shrink-0">{power.actionType}</span>
                      {power.cost !== 'None' && power.cost && (
                        <span className="text-xs text-gray-500 shrink-0">{power.cost}</span>
                      )}
                      {overridden && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300 shrink-0">
                          Overridden
                        </span>
                      )}
                      {homebrewOnly && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 shrink-0">
                          Homebrew
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{power.effectsText}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startView(power)}
                      className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => startEdit(power)}
                      className="text-xs px-3 py-1.5 rounded border border-amber-800 text-amber-400 hover:border-amber-600 hover:text-amber-300 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
