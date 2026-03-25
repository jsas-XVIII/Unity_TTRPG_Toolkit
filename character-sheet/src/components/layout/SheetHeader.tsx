import type { Character } from '../../types/character'
import type { Dispatch } from 'react'

interface Props {
  character: Character
  dispatch: Dispatch<{ type: 'SET_FIELD'; field: keyof Character; value: unknown }>
}

const FIELD_LABEL: Partial<Record<keyof Character, string>> = {
  name: 'Name',
  className: 'Class',
  race: 'Race',
  level: 'Level',
  xp: 'XP',
  age: 'Age',
}

export default function SheetHeader({ character, dispatch }: Props) {
  function handleChange(field: keyof Character, value: unknown) {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-400 mb-1">{FIELD_LABEL.name}</label>
          <input
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-lg font-semibold focus:outline-none focus:border-amber-500"
            value={character.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Character Name"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{FIELD_LABEL.className}</label>
          <input
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500"
            value={character.className}
            readOnly
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{FIELD_LABEL.race}</label>
          <input
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500"
            value={character.race}
            readOnly
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{FIELD_LABEL.level}</label>
          <input
            type="number"
            min={1}
            max={10}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500"
            value={character.level}
            onChange={(e) => handleChange('level', parseInt(e.target.value, 10) || 1)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{FIELD_LABEL.xp}</label>
          <input
            type="number"
            min={0}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500"
            value={character.xp}
            onChange={(e) => handleChange('xp', parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-4">
        <div>
          <label className="text-xs text-gray-400 mr-2">{FIELD_LABEL.age}:</label>
          <input
            className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-white text-sm focus:outline-none focus:border-amber-500"
            value={character.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="Age"
          />
        </div>
      </div>
    </header>
  )
}
