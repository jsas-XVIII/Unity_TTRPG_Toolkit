import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Power } from '../../types/character'
import type { Dispatch } from 'react'
import PowerCard from './PowerCard'

type Action =
  | { type: 'ADD_POWER'; power: Power }
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }

interface Props {
  powers: Power[]
  dispatch: Dispatch<Action>
}

const BLANK_POWER: Omit<Power, 'id'> = {
  name: 'New Power',
  tier: 1,
  actionType: 'Standard',
  cost: '1',
  target: 'Single',
  range: 'Adjacent',
  effectsText: '',
  upgrades: [],
}

export default function PowerList({ powers, dispatch }: Props) {
  const [addTier, setAddTier] = useState<1 | 2>(1)

  const tier1 = powers.filter((p) => p.tier === 1)
  const tier2 = powers.filter((p) => p.tier === 2)

  function addPower() {
    dispatch({ type: 'ADD_POWER', power: { ...BLANK_POWER, id: uuidv4(), tier: addTier } })
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Powers</h2>

      {tier1.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Tier I</p>
          <div className="space-y-1">
            {tier1.map((p) => <PowerCard key={p.id} power={p} dispatch={dispatch} />)}
          </div>
        </div>
      )}

      {tier2.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-amber-700 uppercase mb-2">Tier II</p>
          <div className="space-y-1">
            {tier2.map((p) => <PowerCard key={p.id} power={p} dispatch={dispatch} />)}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <select
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
          value={addTier}
          onChange={(e) => setAddTier(Number(e.target.value) as 1 | 2)}
        >
          <option value={1}>Tier I</option>
          <option value={2}>Tier II</option>
        </select>
        <button
          className="flex-1 py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm transition-colors"
          onClick={addPower}
        >
          + Add Power
        </button>
      </div>
    </div>
  )
}
