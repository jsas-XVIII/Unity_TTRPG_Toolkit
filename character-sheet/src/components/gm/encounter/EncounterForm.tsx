import { useState, useMemo } from 'react'
import type { SavedEncounter, EncounterEntry } from '../../../types/encounter'
import { getAllMonsters } from '../../../data/monstersData'
import { uid } from '../../../utils/idGenerator'
import MonsterCard from '../monsters/MonsterCard'

interface Props {
  initial?: SavedEncounter
  onSave: (enc: SavedEncounter) => void
  onRunNow: (enc: SavedEncounter) => void
  onCancel: () => void
}

function dlColor(dl: number): string {
  if (dl <= 3) return 'bg-green-900 text-green-300'
  if (dl <= 6) return 'bg-yellow-900 text-yellow-300'
  if (dl <= 8) return 'bg-orange-900 text-orange-300'
  return 'bg-red-900 text-red-300'
}

export default function EncounterForm({ initial, onSave, onRunNow, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [entries, setEntries] = useState<EncounterEntry[]>(initial?.entries ?? [])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'Standard' | 'Elite'>('all')
  const [viewingMonsterId, setViewingMonsterId] = useState<string | null>(null)
  // Holds template selections for monsters not yet in the roster so they carry over on Add
  const [pendingTemplates, setPendingTemplates] = useState<Record<string, string[]>>({})

  const allMonsters = useMemo(() => getAllMonsters(), [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allMonsters
      .filter((m) => {
        if (typeFilter !== 'all' && m.type !== typeFilter) return false
        if (q && !m.name.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => a.dangerLevel - b.dangerLevel)
  }, [allMonsters, search, typeFilter])

  function addMonster(monsterId: string) {
    setEntries((prev) => {
      const existing = prev.find((e) => e.monsterId === monsterId)
      if (existing) {
        return prev.map((e) => (e.monsterId === monsterId ? { ...e, count: e.count + 1 } : e))
      }
      return [...prev, { monsterId, count: 1, templateIds: pendingTemplates[monsterId] ?? [] }]
    })
  }

  // Updates the roster entry directly if the monster is already added; otherwise stages in
  // pendingTemplates so selections carry over when the user clicks Add.
  function handleTemplatesChange(monsterId: string, templateIds: string[]) {
    const inRoster = entries.find((e) => e.monsterId === monsterId)
    if (inRoster) {
      setEntries((prev) => prev.map((e) => (e.monsterId === monsterId ? { ...e, templateIds } : e)))
    } else {
      setPendingTemplates((prev) => ({ ...prev, [monsterId]: templateIds }))
    }
  }

  function setCount(monsterId: string, count: number) {
    if (count < 1) return
    setEntries((prev) => prev.map((e) => (e.monsterId === monsterId ? { ...e, count } : e)))
  }

  function removeEntry(monsterId: string) {
    setEntries((prev) => prev.filter((e) => e.monsterId !== monsterId))
  }

  function buildEncounter(): SavedEncounter | null {
    if (!name.trim() || entries.length === 0) return null
    return {
      id: initial?.id ?? `enc-${uid()}`,
      name: name.trim(),
      entries,
    }
  }

  const isValid = name.trim().length > 0 && entries.length > 0

  if (viewingMonsterId) {
    const monster = allMonsters.find((m) => m.id === viewingMonsterId)
    if (monster) {
      const inRoster = entries.find((e) => e.monsterId === viewingMonsterId)
      const currentTemplateIds = inRoster?.templateIds ?? pendingTemplates[viewingMonsterId] ?? []
      return (
        <MonsterCard
          monster={monster}
          onBack={() => setViewingMonsterId(null)}
          backLabel="Back to Encounter"
          initialTemplateIds={currentTemplateIds}
          onTemplatesChange={(ids) => handleTemplatesChange(viewingMonsterId, ids)}
        />
      )
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="px-4 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 text-sm"
        >
          ← Cancel
        </button>
        <h1 className="text-xl font-bold text-gray-100">
          {initial ? `Edit: ${initial.name}` : 'New Encounter'}
        </h1>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-xs text-gray-400 mb-1">Encounter Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ambush at the Crossroads"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Current roster */}
      {entries.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Encounter Roster</h2>
          <div className="space-y-2">
            {entries.map((entry) => {
              const monster = allMonsters.find((m) => m.id === entry.monsterId)
              if (!monster) return null
              return (
                <div
                  key={entry.monsterId}
                  className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2"
                >
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${dlColor(monster.dangerLevel)}`}
                  >
                    DL {monster.dangerLevel}
                  </span>
                  <button
                    onClick={() => setViewingMonsterId(entry.monsterId)}
                    className="flex-1 text-sm text-gray-100 text-left hover:text-amber-300 transition-colors"
                  >
                    {monster.name}
                  </button>
                  {(entry.templateIds?.length ?? 0) > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300 shrink-0">
                      {entry.templateIds!.length}T
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCount(entry.monsterId, entry.count - 1)}
                      disabled={entry.count <= 1}
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm text-gray-200">{entry.count}</span>
                    <button
                      onClick={() => setCount(entry.monsterId, entry.count + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.monsterId)}
                    className="text-gray-600 hover:text-red-400 text-lg leading-none ml-1 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monster picker */}
      <div className="mb-6">
        <h2 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Add Monsters</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search monsters..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          />
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
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">No monsters match.</p>
          ) : (
            filtered.map((m) => {
              const inRoster = entries.find((e) => e.monsterId === m.id)
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded px-3 py-2 transition-colors"
                >
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
                  <button
                    onClick={() => setViewingMonsterId(m.id)}
                    className="flex-1 text-sm text-gray-200 text-left hover:text-amber-300 transition-colors"
                  >
                    {m.name}
                  </button>
                  {inRoster && (
                    <span className="text-xs text-amber-400 shrink-0">×{inRoster.count}</span>
                  )}
                  <button
                    onClick={() => addMonster(m.id)}
                    className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors shrink-0"
                  >
                    + Add
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-800">
        <button
          onClick={() => {
            const enc = buildEncounter()
            if (enc) onSave(enc)
          }}
          disabled={!isValid}
          className="px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => {
            const enc = buildEncounter()
            if (enc) onRunNow(enc)
          }}
          disabled={!isValid}
          className="px-4 py-2 rounded bg-green-800 hover:bg-green-700 text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Run Now
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded border border-gray-700 text-gray-400 hover:border-gray-500 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
