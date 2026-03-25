import type { CorePath } from '../../types/character'
import type { Dispatch } from 'react'

type Action =
  | { type: 'SET_CORE_PATH'; path: CorePath }
  | { type: 'REMOVE_CORE_PATH'; id: string }

interface Props {
  path: CorePath
  dispatch: Dispatch<Action>
}

export default function CorePathEntry({ path, dispatch }: Props) {
  function update(patch: Partial<CorePath>) {
    dispatch({ type: 'SET_CORE_PATH', path: { ...path, ...patch } })
  }

  return (
    <div className="bg-gray-800 rounded p-3 flex gap-3 items-start">
      <div className="flex flex-col items-center gap-1">
        <button
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          onClick={() => update({ points: Math.min(6, path.points + 1) })}
        >+</button>
        <span className="text-xl font-bold text-amber-400 w-6 text-center">{path.points}</span>
        <button
          className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
          onClick={() => update({ points: Math.max(1, path.points - 1) })}
        >−</button>
      </div>
      <div className="flex-1">
        <input
          className="w-full bg-transparent border-b border-gray-600 text-white font-semibold focus:outline-none focus:border-amber-500 mb-1"
          value={path.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Path Name"
        />
        <textarea
          className="w-full bg-transparent text-sm text-gray-400 focus:outline-none resize-none"
          rows={2}
          value={path.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Description (skills covered by this path)"
        />
      </div>
      <button
        className="text-gray-600 hover:text-red-400 text-sm"
        onClick={() => dispatch({ type: 'REMOVE_CORE_PATH', id: path.id })}
        title="Remove path"
      >✕</button>
    </div>
  )
}
