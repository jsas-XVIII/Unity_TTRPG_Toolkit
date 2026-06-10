import { useState } from 'react'
import type { Monster, MonsterTemplate } from '../../../types/monster'
import {
  resolveTraits,
  resolvePowers,
  getAllTemplates,
  applyTemplates,
} from '../../../data/monstersData'

function resolveName(text: string, name: string): string {
  return text.replace(/\[NAME\]/g, name)
}

interface Props {
  monster: Monster
  onBack: () => void
  backLabel?: string
  // Seeds the template toggle state from an existing roster entry or pending selection.
  initialTemplateIds?: string[]
  // Fires on every toggle so the parent (EncounterForm or EncounterTracker) can sync its state.
  onTemplatesChange?: (ids: string[]) => void
  // True when viewing a monster mid-combat; shows applied templates but prevents changes.
  readOnlyTemplates?: boolean
  onEdit?: () => void
  onClone?: () => void
}

function dlColor(dl: number): string {
  if (dl <= 3) return 'bg-green-900 text-green-300'
  if (dl <= 6) return 'bg-yellow-900 text-yellow-300'
  if (dl <= 8) return 'bg-orange-900 text-orange-300'
  return 'bg-red-900 text-red-300'
}

function deltaLabel(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`
}

function StatBox({
  label,
  value,
  delta,
  color = 'text-white',
}: {
  label: string
  value: number
  delta?: number
  color?: string
}) {
  const hasDelta = delta !== undefined && delta !== 0
  return (
    <div className="bg-gray-900 rounded p-2">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className={`text-lg font-bold ${color}`}>
        {value}
        {hasDelta && (
          <span className={`text-xs ml-1 ${delta! > 0 ? 'text-green-400' : 'text-red-400'}`}>
            ({deltaLabel(delta!)})
          </span>
        )}
      </p>
    </div>
  )
}

export default function MonsterCard({
  monster,
  onBack,
  backLabel = 'Back to Compendium',
  initialTemplateIds,
  onTemplatesChange,
  readOnlyTemplates = false,
  onEdit,
  onClone,
}: Props) {
  const allTemplates = getAllTemplates()
  const [activeTemplateIds, setActiveTemplateIds] = useState<string[]>(initialTemplateIds ?? [])

  const activeTemplates: MonsterTemplate[] = activeTemplateIds
    .map((id) => allTemplates.find((t) => t.id === id))
    .filter((t): t is MonsterTemplate => t !== undefined)

  const displayed = applyTemplates(monster, activeTemplates)

  const traits = resolveTraits(displayed)
  const powers = resolvePowers(displayed)
  const isElite = monster.type === 'Elite'

  function toggleTemplate(id: string) {
    setActiveTemplateIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      onTemplatesChange?.(next)
      return next
    })
  }

  function statDelta(key: keyof Monster): number {
    return activeTemplates.reduce((sum, t) => {
      const deltaKey = `${key}Delta` as keyof MonsterTemplate
      const v = t[deltaKey]
      return sum + (typeof v === 'number' ? v : 0)
    }, 0)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← {backLabel}
        </button>
        <div className="flex items-center gap-2">
          {onClone && (
            <button
              onClick={onClone}
              className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
            >
              Clone as Homebrew
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-amber-600 hover:text-amber-400 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Template selector */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1.5">Templates</p>
        <div className="flex flex-wrap gap-1.5">
          {allTemplates.map((t) => {
            const active = activeTemplateIds.includes(t.id)
            return (
              <button
                key={t.id}
                onClick={() => !readOnlyTemplates && toggleTemplate(t.id)}
                disabled={readOnlyTemplates}
                title={t.description}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? 'bg-amber-700 border-amber-500 text-amber-100'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                } ${readOnlyTemplates ? 'cursor-default' : ''}`}
              >
                {t.name}
              </button>
            )
          })}
        </div>
        {activeTemplates.length > 0 && !readOnlyTemplates && (
          <button
            onClick={() => {
              setActiveTemplateIds([])
              onTemplatesChange?.([])
            }}
            className="mt-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Header */}
      <div
        className={`rounded-t-lg px-5 py-4 flex items-center justify-between ${isElite ? 'bg-purple-900' : 'bg-red-900'}`}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{monster.name}</h1>
          <p className="text-sm text-gray-300 mt-0.5">
            {monster.size} · {monster.faction ?? 'Unknown Faction'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${dlColor(monster.dangerLevel)}`}
          >
            DL {monster.dangerLevel}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${isElite ? 'bg-purple-700 text-purple-200' : 'bg-red-800 text-red-200'}`}
          >
            {monster.type}
          </span>
          <span className="text-xs text-gray-400">{monster.xp} XP</span>
        </div>
      </div>

      {/* Image */}
      {monster.imageUrl && (
        <a href={monster.imageUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={monster.imageUrl}
            alt={monster.name}
            className="w-full object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
            title="Click to open full image (for Roll20)"
          />
        </a>
      )}

      {/* Core Stats */}
      <div className="bg-gray-800 px-5 py-4 grid grid-cols-3 gap-3 text-center">
        {(
          [
            { label: 'HP', key: 'hp' },
            { label: 'AR', key: 'ar' },
            { label: 'DR', key: 'dr' },
            { label: 'MR', key: 'mr' },
            { label: 'AV', key: 'av' },
            { label: 'SPD', key: 'spd' },
          ] as { label: string; key: keyof Monster }[]
        ).map(({ label, key }) => (
          <StatBox
            key={label}
            label={label}
            value={displayed[key] as number}
            delta={statDelta(key)}
          />
        ))}
      </div>

      {/* Attributes */}
      <div className="bg-gray-800 px-5 py-3 grid grid-cols-4 gap-3 text-center mt-0.5">
        {(
          [
            { label: 'Might', key: 'might' },
            { label: 'Agility', key: 'agility' },
            { label: 'Mind', key: 'mind' },
            { label: 'Presence', key: 'presence' },
          ] as { label: string; key: keyof Monster }[]
        ).map(({ label, key }) => (
          <StatBox
            key={label}
            label={label}
            value={displayed[key] as number}
            delta={statDelta(key)}
            color="text-amber-400"
          />
        ))}
      </div>

      {/* Attacks */}
      {monster.attacks.length > 0 && (
        <div className="bg-gray-900 px-5 py-4 mt-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Attacks
          </h2>
          <div className="space-y-1.5">
            {monster.attacks.map((a, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-white">{a.name}</p>
                <p className="text-xs text-gray-500">{a.range}</p>
                <p className="text-sm text-gray-300">{a.damage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traits */}
      {traits.length > 0 && (
        <div className="bg-gray-900 px-5 py-4 mt-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Traits</h2>
          <div className="space-y-3">
            {traits.map((t) => (
              <div key={t.id}>
                <p className="text-sm font-semibold text-amber-300">{t.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {resolveName(t.description, monster.name)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Powers */}
      {powers.length > 0 && (
        <div className="bg-gray-900 px-5 py-4 mt-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Powers</h2>
          <div className="space-y-3">
            {powers.map((p) => (
              <div key={p.id} className="border-l-2 border-gray-700 pl-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  {p.ruinCost != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">
                      {p.ruinCost} Ruin
                    </span>
                  )}
                  {p.recharge != null && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                      {p.recharge}rd recharge
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {resolveName(p.description, monster.name)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {monster.notes && (
        <div className="bg-gray-900 px-5 py-4 mt-1 rounded-b-lg">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h2>
          <p className="text-sm text-gray-400">{monster.notes}</p>
        </div>
      )}
    </div>
  )
}
