import type { Attributes } from '../../types/character'
import type { Dispatch } from 'react'

type AttrKey = keyof Attributes
type AttrAction = { type: 'SET_ATTRIBUTE'; attr: AttrKey; value: number }

interface Props {
  attributes: Attributes
  dispatch: Dispatch<AttrAction>
}

const ATTRS: { key: AttrKey; label: string; desc: string }[] = [
  { key: 'might', label: 'MIGHT', desc: 'Strength, endurance, HP' },
  { key: 'agility', label: 'AGILITY', desc: 'Speed, reflexes, DR' },
  { key: 'mind', label: 'MIND', desc: 'Intelligence, MR' },
  { key: 'presence', label: 'PRESENCE', desc: 'Charisma, social' },
]

export default function AttributeBlock({ attributes, dispatch }: Props) {
  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attributes</h2>
      <div className="grid grid-cols-2 gap-3">
        {ATTRS.map(({ key, label, desc }) => {
          const val = attributes[key]
          return (
            <div key={key} className="flex flex-col items-center bg-gray-800 rounded p-3">
              <span className="text-xs text-gray-400 mb-1" title={desc}>
                {label}
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm leading-none"
                  onClick={() => dispatch({ type: 'SET_ATTRIBUTE', attr: key, value: val - 1 })}
                >
                  −
                </button>
                <span
                  className={`w-8 text-center text-xl font-bold ${val > 0 ? 'text-amber-400' : val < 0 ? 'text-red-400' : 'text-white'}`}
                >
                  {val > 0 ? `+${val}` : val}
                </span>
                <button
                  className="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-sm leading-none"
                  onClick={() => dispatch({ type: 'SET_ATTRIBUTE', attr: key, value: val + 1 })}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
