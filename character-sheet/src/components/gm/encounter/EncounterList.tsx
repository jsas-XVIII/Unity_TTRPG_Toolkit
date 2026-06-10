import { useMemo } from 'react'
import type { SavedEncounter } from '../../../types/encounter'
import { getAllMonsters } from '../../../data/monstersData'

interface Props {
  encounters: SavedEncounter[]
  onBack: () => void
  onCreate: () => void
  onEdit: (enc: SavedEncounter) => void
  onRun: (enc: SavedEncounter) => void
  onDelete: (id: string) => void
}

export default function EncounterList({
  encounters,
  onBack,
  onCreate,
  onEdit,
  onRun,
  onDelete,
}: Props) {
  const monsterMap = useMemo(() => {
    const map = new Map<string, { name: string }>()
    for (const m of getAllMonsters()) map.set(m.id, { name: m.name })
    return map
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-100">Encounter Builder</h1>
        <div className="ml-auto">
          <button
            onClick={onCreate}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            + New Encounter
          </button>
        </div>
      </div>

      {encounters.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm">No encounters saved yet.</p>
          <p className="text-xs mt-1">Create one to pre-build your fights.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {encounters.map((enc) => {
            const totalCount = enc.entries.reduce((sum, e) => sum + e.count, 0)
            const monsterSummary =
              enc.entries
                .slice(0, 3)
                .map((e) => {
                  const m = monsterMap.get(e.monsterId)
                  return m ? `${m.name}${e.count > 1 ? ` ×${e.count}` : ''}` : 'Unknown'
                })
                .join(', ') + (enc.entries.length > 3 ? '…' : '')

            return (
              <div key={enc.id} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100 truncate">{enc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{monsterSummary}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {totalCount} monster{totalCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRun(enc)}
                      className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
                    >
                      Run
                    </button>
                    <button
                      onClick={() => onEdit(enc)}
                      className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(enc.id)}
                      className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-500 hover:border-red-700 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
