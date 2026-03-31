import type { Character } from '../../types/character'
import type { Dispatch } from 'react'

type Action = { type: 'SET_FIELD'; field: keyof Character; value: unknown }

interface Props {
  denerim: number
  necessities: number
  gear: number
  dispatch: Dispatch<Action>
}

export default function InventoryBlock({ denerim, necessities, gear, dispatch }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase mb-2">Inventory</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded p-2">
          <label className="text-xs text-gray-400 block mb-1">Denerim</label>
          <input
            type="number"
            min={0}
            className="w-full bg-transparent text-amber-400 font-bold text-lg focus:outline-none"
            value={denerim}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'denerim',
                value: parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>
        <div className="bg-gray-800 rounded p-2">
          <label className="text-xs text-gray-400 block mb-1">Necessities</label>
          <input
            type="number"
            min={0}
            className="w-full bg-transparent text-white font-bold text-lg focus:outline-none"
            value={necessities}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'necessities',
                value: parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>
        <div className="bg-gray-800 rounded p-2">
          <label className="text-xs text-gray-400 block mb-1">Gear</label>
          <input
            type="number"
            min={0}
            className="w-full bg-transparent text-white font-bold text-lg focus:outline-none"
            value={gear}
            onChange={(e) =>
              dispatch({
                type: 'SET_FIELD',
                field: 'gear',
                value: parseInt(e.target.value, 10) || 0,
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
