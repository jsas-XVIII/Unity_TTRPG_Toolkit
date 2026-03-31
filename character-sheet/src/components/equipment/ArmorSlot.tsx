import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ArmorItem } from '../../types/equipment'
import type { Dispatch } from 'react'
import { ARMOR_TEMPLATES } from '../../constants/armor'

type Action = { type: 'ADD_ARMOR'; armor: ArmorItem } | { type: 'REMOVE_ARMOR'; id: string }

interface Props {
  armor: ArmorItem[]
  dispatch: Dispatch<Action>
}

export default function ArmorSlot({ armor, dispatch }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  function addArmor() {
    const template = ARMOR_TEMPLATES[selectedIdx]
    dispatch({
      type: 'ADD_ARMOR',
      armor: {
        id: uuidv4(),
        name: template.examples[0],
        category: template.category,
        quality: template.quality,
        av: template.av,
        cost: template.cost,
        notes: '',
      },
    })
  }

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase mb-2">Armor</p>
      {armor.length === 0 && <p className="text-xs text-gray-600 italic mb-2">No armor</p>}
      {armor.map((a) => (
        <div key={a.id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 mb-1">
          <div className="flex-1">
            <span className="text-sm font-semibold text-white">{a.name}</span>
            <span className="ml-2 text-xs text-gray-500">
              {a.quality} {a.category} · +{a.av} AV
            </span>
          </div>
          <button
            className="text-gray-600 hover:text-red-400 text-xs"
            onClick={() => dispatch({ type: 'REMOVE_ARMOR', id: a.id })}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <select
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300"
          value={selectedIdx}
          onChange={(e) => setSelectedIdx(Number(e.target.value))}
        >
          {ARMOR_TEMPLATES.map((t, i) => (
            <option key={i} value={i}>
              {t.quality} {t.category} (+{t.av} AV)
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs text-gray-300"
          onClick={addArmor}
        >
          Add
        </button>
      </div>
    </div>
  )
}
