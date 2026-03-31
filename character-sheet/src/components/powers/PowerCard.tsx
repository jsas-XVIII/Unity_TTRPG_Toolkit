import { useState } from 'react'
import type { Power } from '../../types/character'
import type { Dispatch } from 'react'

type Action =
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }

interface Props {
  power: Power
  dispatch: Dispatch<Action>
}

const ACTION_COLOR: Record<string, string> = {
  Standard: 'bg-blue-900 text-blue-300',
  Quick: 'bg-green-900 text-green-300',
  Movement: 'bg-cyan-900 text-cyan-300',
  Free: 'bg-gray-700 text-gray-300',
  Reaction: 'bg-yellow-900 text-yellow-300',
  Maintain: 'bg-orange-900 text-orange-300',
  Overdrive: 'bg-purple-900 text-purple-300',
  Ultimate: 'bg-red-900 text-red-300',
  Passive: 'bg-gray-800 text-gray-400',
}

export default function PowerCard({ power, dispatch }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
      <button
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-750"
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-mono ${ACTION_COLOR[power.actionType] ?? 'bg-gray-700 text-gray-400'}`}
        >
          {power.actionType}
        </span>
        <span className="flex-1 text-white font-semibold text-sm">{power.name}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${power.tier === 1 ? 'bg-gray-700 text-gray-400' : 'bg-amber-900 text-amber-300'}`}
        >
          T{power.tier}
        </span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 border-t border-gray-700 pt-2 space-y-2">
          <div className="flex gap-4 text-xs text-gray-400">
            <span>
              Cost: <strong className="text-white">{power.cost}</strong>
            </span>
            <span>
              Target: <strong className="text-white">{power.target}</strong>
            </span>
            <span>
              Range: <strong className="text-white">{power.range}</strong>
            </span>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{power.effectsText}</p>

          {power.upgrades.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Upgrades</p>
              {power.upgrades.map((u) => (
                <label key={u.id} className="flex items-start gap-2 text-sm mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={u.purchased}
                    onChange={() =>
                      dispatch({ type: 'TOGGLE_UPGRADE', powerId: power.id, upgradeId: u.id })
                    }
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className={u.purchased ? 'text-amber-300' : 'text-gray-400'}>
                    <strong>{u.name}.</strong> {u.description}
                  </span>
                </label>
              ))}
            </div>
          )}

          <button
            className="text-xs text-red-500 hover:text-red-400"
            onClick={() => dispatch({ type: 'REMOVE_POWER', id: power.id })}
          >
            Remove Power
          </button>
        </div>
      )}
    </div>
  )
}
