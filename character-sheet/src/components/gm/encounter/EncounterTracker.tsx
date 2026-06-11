import { useState, useMemo } from 'react'
import type { SavedEncounter } from '../../../types/encounter'
import type { ActionType } from '../../../types/character'
import type { Campaign } from '../../../types/campaign'
import { getAllMonsters, getAllTemplates, applyTemplates } from '../../../data/monstersData'
import { getCampaigns, upsertCampaign } from '../../../services/campaignStorage'
import MonsterCard from '../monsters/MonsterCard'
import RuinWidget from '../RuinWidget'

interface Props {
  encounter: SavedEncounter
  campaignId?: string
  onEnd: () => void
}

interface Combatant {
  id: string
  monsterId: string
  label: string
  dangerLevel: number
  type: string
  maxHp: number
  currentHp: number
  templateIds: string[]
  usedActions: ActionType[]
  defeated: boolean
}

const TRACKABLE_ACTIONS: ActionType[] = [
  'Standard',
  'Movement',
  'Quick',
  'Free',
  'Reaction',
  'Maintain',
  'Overdrive',
  'Ultimate',
]

function dlColor(dl: number): string {
  if (dl <= 3) return 'bg-green-900 text-green-300'
  if (dl <= 6) return 'bg-yellow-900 text-yellow-300'
  if (dl <= 8) return 'bg-orange-900 text-orange-300'
  return 'bg-red-900 text-red-300'
}

export default function EncounterTracker({ encounter, campaignId, onEnd }: Props) {
  const [campaign, setCampaign] = useState<Campaign | null>(() =>
    campaignId ? (getCampaigns().find((c) => c.id === campaignId) ?? null) : null
  )

  // Re-reads from storage after upsert so local state reflects exactly what was persisted,
  // consistent with the pattern used across all other storage-backed state in this app.
  function handleRuinUpdate(updated: Campaign) {
    upsertCampaign(updated)
    setCampaign(getCampaigns().find((c) => c.id === updated.id) ?? null)
  }

  // Expands each encounter entry into individual combatants (e.g. Goblin ×3 → Goblin 1/2/3)
  // and applies any saved templates to compute each combatant's starting HP and stats.
  const initialCombatants = useMemo<Combatant[]>(() => {
    const monsterMap = new Map(getAllMonsters().map((m) => [m.id, m]))
    const allTemplates = getAllTemplates()
    const result: Combatant[] = []
    for (const entry of encounter.entries) {
      const monster = monsterMap.get(entry.monsterId)
      if (!monster) continue
      const entryTemplateIds = entry.templateIds ?? []
      const selectedTemplates = allTemplates.filter((t) => entryTemplateIds.includes(t.id))
      const displayed = applyTemplates(monster, selectedTemplates)
      for (let i = 0; i < entry.count; i++) {
        result.push({
          id: `${entry.monsterId}-${i}`,
          monsterId: entry.monsterId,
          label: entry.count > 1 ? `${monster.name} ${i + 1}` : monster.name,
          dangerLevel: displayed.dangerLevel,
          type: monster.type,
          maxHp: displayed.hp,
          currentHp: displayed.hp,
          templateIds: entryTemplateIds,
          usedActions: [],
          defeated: false,
        })
      }
    }
    return result
  }, [encounter])

  // Separate from initialCombatants so the stat card view (viewingMonsterId) can look up the
  // base monster data without re-running the full combatant expansion.
  const monsterMap = useMemo(() => new Map(getAllMonsters().map((m) => [m.id, m])), [])

  const [combatants, setCombatants] = useState<Combatant[]>(initialCombatants)
  const [viewingMonsterId, setViewingMonsterId] = useState<string | null>(null)

  const alive = combatants.filter((c) => !c.defeated)
  const allDefeated = alive.length === 0

  function adjustHp(id: string, delta: number) {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, currentHp: Math.max(0, Math.min(c.maxHp, c.currentHp + delta)) } : c
      )
    )
  }

  function setHp(id: string, value: string) {
    const num = parseInt(value)
    if (isNaN(num)) return
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, currentHp: Math.max(0, Math.min(c.maxHp, num)) } : c))
    )
  }

  function toggleDefeated(id: string) {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, defeated: !c.defeated } : c)))
  }

  function toggleAction(id: string, action: ActionType) {
    setCombatants((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const usedActions = c.usedActions.includes(action)
          ? c.usedActions.filter((a) => a !== action)
          : [...c.usedActions, action]
        return { ...c, usedActions }
      })
    )
  }

  function resetActions(id: string) {
    setCombatants((prev) => prev.map((c) => (c.id === id ? { ...c, usedActions: [] } : c)))
  }

  function resetAllActions() {
    setCombatants((prev) => prev.map((c) => ({ ...c, usedActions: [] })))
  }

  if (viewingMonsterId) {
    const monster = monsterMap.get(viewingMonsterId)
    if (monster) {
      const templateIds =
        combatants.find((c) => c.monsterId === viewingMonsterId)?.templateIds ?? []
      return (
        <MonsterCard
          monster={monster}
          onBack={() => setViewingMonsterId(null)}
          backLabel="Back to Encounter"
          initialTemplateIds={templateIds}
          readOnlyTemplates
        />
      )
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onEnd}
          className="px-4 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 text-sm"
        >
          ← End Encounter
        </button>
        <h1 className="text-xl font-bold text-gray-100 flex-1 truncate">{encounter.name}</h1>
      </div>

      {campaign && (
        <div className="mb-6">
          <RuinWidget campaign={campaign} onUpdate={handleRuinUpdate} />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={resetAllActions}
          className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
        >
          Reset All Actions
        </button>
        {allDefeated && (
          <span className="text-xs text-green-400 font-semibold">All enemies defeated!</span>
        )}
      </div>

      {/* Combatant list */}
      <div className="space-y-3">
        {combatants.map((c) => {
          const hpPercent = c.maxHp > 0 ? Math.round((c.currentHp / c.maxHp) * 100) : 0
          const hpBarColor =
            hpPercent > 50 ? 'bg-green-600' : hpPercent > 25 ? 'bg-yellow-600' : 'bg-red-600'

          return (
            <div
              key={c.id}
              className={`rounded-lg border px-4 py-3 transition-colors ${
                c.defeated
                  ? 'bg-gray-950 border-gray-800 opacity-50'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              {/* Top row: name, badges, defeated */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setViewingMonsterId(c.monsterId)}
                  className={`font-semibold flex-1 min-w-0 truncate text-left hover:text-amber-300 transition-colors ${c.defeated ? 'line-through text-gray-500' : 'text-gray-100'}`}
                >
                  {c.label}
                </button>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${dlColor(c.dangerLevel)}`}
                >
                  DL {c.dangerLevel}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${c.type === 'Elite' ? 'bg-purple-900 text-purple-300' : 'bg-red-950 text-red-400'}`}
                >
                  {c.type}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={c.defeated}
                    onChange={() => toggleDefeated(c.id)}
                    className="accent-red-500"
                  />
                  Defeated
                </label>
              </div>

              {/* HP row */}
              <div className="flex items-center gap-2 mt-2 ml-4 flex-wrap">
                <span className="text-xs text-gray-500 shrink-0">HP:</span>
                <button
                  onClick={() => adjustHp(c.id, -5)}
                  disabled={c.defeated}
                  className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  −5
                </button>
                <button
                  onClick={() => adjustHp(c.id, -1)}
                  disabled={c.defeated}
                  className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  −1
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={c.currentHp}
                    onChange={(e) => setHp(c.id, e.target.value)}
                    disabled={c.defeated}
                    className="w-14 bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-center text-gray-200 focus:outline-none focus:border-amber-500 disabled:opacity-40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-xs text-gray-500">/ {c.maxHp}</span>
                </div>
                <button
                  onClick={() => adjustHp(c.id, 1)}
                  disabled={c.defeated}
                  className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => adjustHp(c.id, 5)}
                  disabled={c.defeated}
                  className="text-xs px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  +5
                </button>
                {/* HP bar */}
                <div className="flex-1 min-w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${hpBarColor}`}
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-1.5 mt-2 ml-4 flex-wrap">
                {TRACKABLE_ACTIONS.map((action) => {
                  const used = c.usedActions.includes(action)
                  return (
                    <button
                      key={action}
                      onClick={() => !c.defeated && toggleAction(c.id, action)}
                      disabled={c.defeated}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors disabled:cursor-not-allowed ${
                        used
                          ? 'bg-gray-800 border-gray-700 text-gray-600 line-through'
                          : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {action}
                    </button>
                  )
                })}
                {c.usedActions.length > 0 && !c.defeated && (
                  <button
                    onClick={() => resetActions(c.id)}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
