import { useState, useMemo } from 'react'
import { useDataRefresh } from '../../../hooks/useDataRefresh'
import type { Perk } from '../../../types/character'
import { getAllPerks, getOfficialPerks, isOfficialPerk } from '../../../data/perksData'
import {
  upsertHomebrewPerk,
  deleteHomebrewPerk,
  getHomebrewPerks,
} from '../../../services/perksStorage'
import PerkEditorForm from './PerkEditorForm'
import { uid } from '../../../utils/idGenerator'

interface Props {
  onBack: () => void
}

export default function PerksPanel({ onBack }: Props) {
  const [editing, setEditing] = useState<{ perk: Perk; readOnly: boolean } | null>(null)
  const [refreshKey, refresh] = useDataRefresh()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const homebrewPerks = useMemo(() => getHomebrewPerks(), [refreshKey])
  const homebrewIds = useMemo(() => new Set(homebrewPerks.map((p) => p.id)), [homebrewPerks])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const perks = useMemo(() => getAllPerks(), [refreshKey])

  function startView(perk: Perk) {
    setEditing({ perk, readOnly: true })
  }

  function startEdit(perk: Perk) {
    setEditing({ perk, readOnly: false })
  }

  function startNew() {
    setEditing({
      perk: { id: `hb-perk-${uid()}`, name: '', description: '', source: 'General' },
      readOnly: false,
    })
  }

  function handleSave(perk: Perk) {
    upsertHomebrewPerk(perk)
    refresh()
    setEditing(null)
  }

  function handleReset(id: string) {
    deleteHomebrewPerk(id)
    refresh()
    setEditing(null)
  }

  function handleDelete(id: string) {
    deleteHomebrewPerk(id)
    refresh()
    setEditing(null)
  }

  if (editing) {
    const { perk, readOnly } = editing
    const official = isOfficialPerk(perk.id)
    const overridden = official && homebrewIds.has(perk.id)
    return (
      <PerkEditorForm
        initial={perk}
        isOfficial={official}
        isOverridden={overridden}
        readOnly={readOnly}
        onSave={handleSave}
        onReset={overridden ? () => handleReset(perk.id) : undefined}
        onDelete={!official ? () => handleDelete(perk.id) : undefined}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-100">Perks Editor</h1>
        <span className="text-xs text-gray-500">{perks.length} perks</span>
        <div className="ml-auto">
          <button
            onClick={startNew}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            + New Perk
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {perks.map((perk) => {
          const official = isOfficialPerk(perk.id)
          const overridden = official && homebrewIds.has(perk.id)
          const homebrewOnly = !official

          return (
            <div
              key={perk.id}
              className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-100">{perk.name}</span>
                  {overridden && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300">
                      Overridden
                    </span>
                  )}
                  {homebrewOnly && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                      Homebrew
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-snug line-clamp-2">
                  {perk.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startView(perk)}
                  className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => startEdit(perk)}
                  className="text-xs px-3 py-1.5 rounded border border-amber-800 text-amber-400 hover:border-amber-600 hover:text-amber-300 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Official count reference */}
      <p className="mt-4 text-xs text-gray-600">
        {getOfficialPerks().length} official · {homebrewIds.size} homebrew
      </p>
    </div>
  )
}
