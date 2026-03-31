import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Weapon } from '../../types/equipment'
import type { Dispatch } from 'react'
import { WEAPON_TEMPLATES } from '../../constants/weapons'

type Action = { type: 'ADD_WEAPON'; weapon: Weapon } | { type: 'REMOVE_WEAPON'; id: string }

interface Props {
  weapons: Weapon[]
  dispatch: Dispatch<Action>
}

export default function WeaponSlots({ weapons, dispatch }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(WEAPON_TEMPLATES[0].category)

  function addWeapon() {
    const template = WEAPON_TEMPLATES.find((t) => t.category === selectedCategory)!
    dispatch({
      type: 'ADD_WEAPON',
      weapon: {
        id: uuidv4(),
        name: template.examples[0],
        category: template.category,
        damageDie: template.damageDie,
        cost: template.cost,
        notes: '',
      },
    })
  }

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase mb-2">Weapons</p>
      {weapons.length === 0 && <p className="text-xs text-gray-600 italic mb-2">No weapons</p>}
      {weapons.map((w) => (
        <div key={w.id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 mb-1">
          <div className="flex-1">
            <span className="text-sm font-semibold text-white">{w.name}</span>
            <span className="ml-2 text-xs text-gray-500">
              {w.category} · {w.damageDie}
            </span>
          </div>
          <button
            className="text-gray-600 hover:text-red-400 text-xs"
            onClick={() => dispatch({ type: 'REMOVE_WEAPON', id: w.id })}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-1">
        <select
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as Weapon['category'])}
        >
          {WEAPON_TEMPLATES.map((t) => (
            <option key={t.category} value={t.category}>
              {t.category} ({t.damageDie})
            </option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs text-gray-300"
          onClick={addWeapon}
        >
          Add
        </button>
      </div>
    </div>
  )
}
