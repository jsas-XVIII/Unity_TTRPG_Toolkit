import { useState } from 'react'
import type { Power, ClassName } from '../../../types/character'
import type { HomebrewPower } from '../../../services/powersStorage'
import {
  CLASS_NAMES,
  getPowersByClass,
  isOfficialPower,
  type ResolvedPowerPool,
} from '../../../data/powersData'
import {
  getHomebrewPowers,
  upsertHomebrewPower,
  deleteHomebrewPower,
} from '../../../services/powersStorage'
import PowerEditorForm from './PowerEditorForm'

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

function tierBadge(tier: Power['tier']): string {
  if (tier === 'baseline') return 'bg-sky-900 text-sky-300'
  if (tier === 1) return 'bg-gray-700 text-gray-300'
  if (tier === 2) return 'bg-amber-900 text-amber-300'
  if (tier === 'lv3') return 'bg-green-900 text-green-300'
  if (tier === 'lv8') return 'bg-purple-900 text-purple-300'
  return 'bg-rose-900 text-rose-300'
}

function tierLabel(tier: Power['tier']): string {
  if (tier === 'baseline') return 'Baseline'
  if (tier === 1) return 'T1'
  if (tier === 2) return 'T2'
  if (tier === 'lv3') return 'Lv3'
  if (tier === 'lv8') return 'Lv8'
  return 'Lv10'
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export default function PowersPanel({ onBack }: Props) {
  const [selectedClass, setSelectedClass] = useState<ClassName>('Dreadnought')
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<{ power: HomebrewPower; readOnly: boolean } | null>(null)
  const [, forceUpdate] = useState(0)
  const refresh = () => forceUpdate((n) => n + 1)

  const homebrewIds = new Set(getHomebrewPowers().map((p) => p.id))

  function getPowersForDisplay(): Array<{ power: Power; poolKey: keyof ResolvedPowerPool }> {
    const pools = getPowersByClass(selectedClass)
    const keys = (
      tierFilter === 'all'
        ? (['baseline', 'tier1', 'tier2', 'lv3', 'lv8', 'lv10'] as const)
        : [tierFilter]
    ) as (keyof ResolvedPowerPool)[]
    return keys.flatMap((key) => pools[key].map((power) => ({ power, poolKey: key })))
  }

  const allPowers = getPowersForDisplay()
  const filtered = search.trim()
    ? allPowers.filter((p) => p.power.name.toLowerCase().includes(search.toLowerCase()))
    : allPowers

  function resolvePower(power: Power): HomebrewPower {
    return (
      getHomebrewPowers().find((p) => p.id === power.id) ?? { ...power, className: selectedClass }
    )
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
        tier: 'tier1' as unknown as Power['tier'],
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
    upsertHomebrewPower(power)
    refresh()
    setEditing(null)
  }

  function handleReset(id: string) {
    deleteHomebrewPower(id)
    refresh()
    setEditing(null)
  }

  function handleDelete(id: string) {
    deleteHomebrewPower(id)
    refresh()
    setEditing(null)
  }

  if (editing) {
    const { power, readOnly } = editing
    const official = isOfficialPower(power.id)
    const overridden = official && homebrewIds.has(power.id)
    return (
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
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
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
                      className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${tierBadge(power.tier)}`}
                    >
                      {tierLabel(power.tier)}
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
  )
}
