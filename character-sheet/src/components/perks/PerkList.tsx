import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Perk, PerkSource } from '../../types/character'
import type { Dispatch } from 'react'
import { GENERAL_PERKS } from '../../constants/perks'

type Action =
  | { type: 'ADD_PERK'; perk: Perk }
  | { type: 'REMOVE_PERK'; id: string }

interface Props {
  perks: Perk[]
  dispatch: Dispatch<Action>
}

export default function PerkList({ perks, dispatch }: Props) {
  const source: PerkSource = 'General'
  const [selectedPerkName, setSelectedPerkName] = useState(GENERAL_PERKS[0].name)

  const classPerks = perks.filter((p) => p.source === 'Class')
  const generalPerks = perks.filter((p) => p.source === 'General')

  function addGeneralPerk() {
    const template = GENERAL_PERKS.find((p) => p.name === selectedPerkName)
    if (!template) return
    dispatch({ type: 'ADD_PERK', perk: { ...template, id: uuidv4() } })
  }

  function addCustomPerk() {
    dispatch({
      type: 'ADD_PERK',
      perk: { id: uuidv4(), name: 'New Perk', description: '', source },
    })
  }

  function PerkRow({ perk }: { perk: Perk }) {
    return (
      <div className="flex items-start gap-2 py-1.5 border-b border-gray-800 last:border-0">
        <div className="flex-1">
          <span className="text-sm font-semibold text-white">{perk.name}</span>
          {perk.description && (
            <p className="text-xs text-gray-400 mt-0.5">{perk.description}</p>
          )}
        </div>
        <button
          className="text-gray-600 hover:text-red-400 text-xs"
          onClick={() => dispatch({ type: 'REMOVE_PERK', id: perk.id })}
        >✕</button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Perks</h2>

      {classPerks.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase mb-1">Class Perks</p>
          {classPerks.map((p) => <PerkRow key={p.id} perk={p} />)}
        </div>
      )}

      {generalPerks.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase mb-1">General Perks</p>
          {generalPerks.map((p) => <PerkRow key={p.id} perk={p} />)}
        </div>
      )}

      <div className="border-t border-gray-800 pt-3 space-y-2">
        <div className="flex gap-2">
          <select
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 flex-1"
            value={selectedPerkName}
            onChange={(e) => setSelectedPerkName(e.target.value)}
          >
            {GENERAL_PERKS.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-300"
            onClick={addGeneralPerk}
          >
            Add General
          </button>
        </div>
        <button
          className="w-full py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm"
          onClick={addCustomPerk}
        >
          + Add Custom Class Perk
        </button>
      </div>
    </div>
  )
}
