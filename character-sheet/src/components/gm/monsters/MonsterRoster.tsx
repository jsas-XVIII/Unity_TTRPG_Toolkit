import { useState, useMemo } from 'react'
import { useDataRefresh } from '../../../hooks/useDataRefresh'
import type { Monster } from '../../../types/monster'
import { getAllMonsters, getFactions } from '../../../data/monstersData'
import {
  getHomebrewMonsters,
  addHomebrewMonster,
  updateHomebrewMonster,
  deleteHomebrewMonster,
} from '../../../services/monsterStorage'
import MonsterCard from './MonsterCard'
import MonsterForm from './MonsterForm'
import { uid } from '../../../utils/idGenerator'

interface Props {
  onBack: () => void
}

type RosterView = 'list' | 'card' | 'form'

// Color-codes the DL badge by threat tier. Thresholds are informal UX groupings,
// not hard rules — adjust the breakpoints here if the palette needs to change.
// DL 1–3: low threat · DL 4–6: moderate · DL 7–8: high · DL 9+: extreme
function dlColor(dl: number): string {
  if (dl <= 3) return 'bg-green-900 text-green-300'
  if (dl <= 6) return 'bg-yellow-900 text-yellow-300'
  if (dl <= 8) return 'bg-orange-900 text-orange-300'
  return 'bg-red-900 text-red-300'
}

export default function MonsterRoster({ onBack }: Props) {
  const [view, setView] = useState<RosterView>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingMonster, setEditingMonster] = useState<Monster | undefined>()
  const [factionFilter, setFactionFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Standard' | 'Elite'>('all')
  const [refreshKey, refresh] = useDataRefresh()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allMonsters = useMemo(() => getAllMonsters(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const factions = useMemo(() => getFactions(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const homebrewIds = useMemo(() => new Set(getHomebrewMonsters().map((m) => m.id)), [refreshKey])

  const filtered = useMemo(
    () =>
      allMonsters.filter((m) => {
        if (factionFilter !== 'all' && m.faction !== factionFilter) return false
        if (typeFilter !== 'all' && m.type !== typeFilter) return false
        return true
      }),
    [allMonsters, factionFilter, typeFilter]
  )

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.dangerLevel - b.dangerLevel),
    [filtered]
  )

  function handleSave(monster: Monster) {
    if (editingMonster) {
      updateHomebrewMonster(monster)
    } else {
      addHomebrewMonster(monster)
    }
    refresh()
    setEditingMonster(undefined)
    setView('list')
  }

  function handleClone(monster: Monster) {
    const cloned: Monster = {
      ...monster,
      id: `hb-${uid()}`,
      name: `${monster.name} (Copy)`,
    }
    addHomebrewMonster(cloned)
    refresh()
    setSelectedId(cloned.id)
    setEditingMonster(cloned)
    setView('form')
  }

  function handleDelete(id: string) {
    deleteHomebrewMonster(id)
    refresh()
    setEditingMonster(undefined)
    setSelectedId(null)
    setView('list')
  }

  if (view === 'form') {
    return (
      <MonsterForm
        initial={editingMonster}
        onSave={handleSave}
        onCancel={() => {
          setView(editingMonster && selectedId ? 'card' : 'list')
          setEditingMonster(undefined)
        }}
        onDelete={editingMonster ? () => handleDelete(editingMonster.id) : undefined}
      />
    )
  }

  if (view === 'card' && selectedId) {
    const monster = allMonsters.find((m) => m.id === selectedId)
    if (monster) {
      return (
        <MonsterCard
          monster={monster}
          onBack={() => setView('list')}
          onClone={() => handleClone(monster)}
          onEdit={
            homebrewIds.has(monster.id)
              ? () => {
                  setEditingMonster(monster)
                  setView('form')
                }
              : undefined
          }
        />
      )
    }
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
        <h1 className="text-xl font-bold text-gray-100">Monster Compendium</h1>
        <span className="text-xs text-gray-500">{filtered.length} entries</span>
        <div className="ml-auto">
          <button
            onClick={() => {
              setEditingMonster(undefined)
              setView('form')
            }}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            + New Monster
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          value={factionFilter}
          onChange={(e) => setFactionFilter(e.target.value)}
        >
          <option value="all">All Factions</option>
          {factions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <div className="flex rounded overflow-hidden border border-gray-700">
          {(['all', 'Standard', 'Elite'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs transition-colors ${
                typeFilter === t
                  ? 'bg-amber-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Monster List */}
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No monsters match the current filters.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((m: Monster) => {
            const homebrew = homebrewIds.has(m.id)
            return (
              <div key={m.id} className="relative group">
                <button
                  onClick={() => {
                    setSelectedId(m.id)
                    setView('card')
                  }}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-lg px-4 py-3 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${dlColor(m.dangerLevel)}`}
                    >
                      DL {m.dangerLevel}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${m.type === 'Elite' ? 'bg-purple-900 text-purple-300' : 'bg-red-950 text-red-400'}`}
                    >
                      {m.type}
                    </span>
                    <span className="font-semibold text-gray-100 flex-1">{m.name}</span>
                    {homebrew && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 shrink-0">
                        Homebrew
                      </span>
                    )}
                    <span className="text-xs text-gray-500 shrink-0">{m.faction ?? '—'}</span>
                  </div>
                  <div className="flex gap-4 mt-1.5 ml-1 text-xs text-gray-500">
                    <span>HP {m.hp}</span>
                    <span>AR {m.ar}</span>
                    <span>DR {m.dr}</span>
                    <span>MR {m.mr}</span>
                    <span>{m.xp} XP</span>
                  </div>
                </button>
                {homebrew && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(m.id)
                      setEditingMonster(m)
                      setView('form')
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs text-amber-400 hover:text-amber-300 px-2 py-1 transition-all"
                  >
                    Edit
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
