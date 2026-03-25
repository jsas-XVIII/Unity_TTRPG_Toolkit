import type { Dispatch } from 'react'

type Action =
  | { type: 'SET_HP'; value: number }
  | { type: 'SET_FADING'; value: number }

interface Props {
  currentHp: number
  maxHp: number
  fadingStacks: number
  dispatch: Dispatch<Action>
}

export default function HPTracker({ currentHp, maxHp, fadingStacks, dispatch }: Props) {
  const pct = Math.max(0, Math.min(100, (currentHp / maxHp) * 100))
  const barColor = pct > 50 ? 'bg-green-600' : pct > 25 ? 'bg-yellow-500' : 'bg-red-600'

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Hit Points</h2>

      <div className="flex items-center gap-2 mb-2">
        <button
          className="w-8 h-8 rounded bg-red-800 hover:bg-red-700 text-white font-bold"
          onClick={() => dispatch({ type: 'SET_HP', value: currentHp - 1 })}
        >−</button>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white font-bold">{currentHp}</span>
            <span className="text-gray-400">/ {maxHp}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          className="w-8 h-8 rounded bg-green-800 hover:bg-green-700 text-white font-bold"
          onClick={() => dispatch({ type: 'SET_HP', value: Math.min(maxHp, currentHp + 1) })}
        >+</button>
      </div>

      <div className="mt-3">
        <span className="text-xs text-gray-400 block mb-1">Fading Stacks (0–5)</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'SET_FADING', value: fadingStacks === i + 1 ? i : i + 1 })}
              className={`w-8 h-8 rounded border text-xs font-bold transition-colors ${
                i < fadingStacks
                  ? 'bg-purple-700 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
