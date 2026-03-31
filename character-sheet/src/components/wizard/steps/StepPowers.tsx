import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Power, ActionType } from '../../../types/character'
import type { WizardDraft } from '../WizardTypes'

interface Props {
  draft: WizardDraft
  onChange: (patch: Partial<WizardDraft>) => void
}

const ACTION_TYPES: ActionType[] = [
  'Standard',
  'Quick',
  'Movement',
  'Free',
  'Reaction',
  'Maintain',
  'Overdrive',
  'Ultimate',
  'Passive',
]

const TARGET_POWERS = 3

function PowerRow({
  power,
  onUpdate,
  onRemove,
}: {
  power: Power
  onUpdate: (patch: Partial<Power>) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <button className="text-gray-500 text-xs" onClick={() => setOpen((o) => !o)}>
          {open ? '▲' : '▼'}
        </button>
        <input
          className="flex-1 bg-transparent text-white font-semibold focus:outline-none border-b border-transparent focus:border-amber-500"
          value={power.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Power name"
        />
        <button className="text-gray-600 hover:text-red-400 text-xs" onClick={onRemove}>
          ✕
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-700 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Action Type</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                value={power.actionType}
                onChange={(e) => onUpdate({ actionType: e.target.value as ActionType })}
              >
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Resource Cost</label>
              <input
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                value={power.cost}
                onChange={(e) => onUpdate({ cost: e.target.value })}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Target</label>
              <input
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                value={power.target}
                onChange={(e) => onUpdate({ target: e.target.value })}
                placeholder="Single / AoE…"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Range</label>
              <input
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                value={power.range}
                onChange={(e) => onUpdate({ range: e.target.value })}
                placeholder="Adjacent / Nearby…"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Effects</label>
            <textarea
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 resize-none focus:outline-none"
              rows={3}
              value={power.effectsText}
              onChange={(e) => onUpdate({ effectsText: e.target.value })}
              placeholder="Describe what happens on success / failure…"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function StepPowers({ draft, onChange }: Props) {
  const powers = draft.powers
  const count = powers.length

  function addPower() {
    const newPower: Power = {
      id: uuidv4(),
      name: '',
      tier: 1,
      actionType: 'Standard',
      cost: '1',
      target: 'Single',
      range: 'Adjacent',
      effectsText: '',
      upgrades: [],
    }
    onChange({ powers: [...powers, newPower] })
  }

  function updatePower(id: string, patch: Partial<Power>) {
    onChange({ powers: powers.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  }

  function removePower(id: string) {
    onChange({ powers: powers.filter((p) => p.id !== id) })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Tier I Powers</h2>
        <p className="text-sm text-gray-400">
          At Level 1 you start with <strong className="text-white">3 Tier I Powers</strong> (no
          upgrades yet). Look up your {draft.className ?? 'class'}'s power list in the rulebook and
          enter them here. You can also skip this and fill powers in on the sheet.
        </p>
      </div>

      {/* Counter */}
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${count >= TARGET_POWERS ? 'bg-green-950 border border-green-800' : 'bg-gray-800'}`}
      >
        <span className="text-sm text-gray-400">Powers added:</span>
        <span
          className={`text-xl font-bold ${count >= TARGET_POWERS ? 'text-green-400' : 'text-amber-400'}`}
        >
          {count}
        </span>
        <span className="text-gray-600">/ {TARGET_POWERS} recommended</span>
      </div>

      <div className="space-y-2">
        {powers.map((p) => (
          <PowerRow
            key={p.id}
            power={p}
            onUpdate={(patch) => updatePower(p.id, patch)}
            onRemove={() => removePower(p.id)}
          />
        ))}
      </div>

      <button
        onClick={addPower}
        className="w-full py-2 rounded-lg border-2 border-dashed border-gray-600 text-gray-500 hover:border-gray-400 hover:text-gray-300 text-sm transition-colors"
      >
        + Add Power
      </button>

      <p className="text-xs text-gray-600">
        Upgrades can be added from the character sheet after creation.
      </p>
    </div>
  )
}
