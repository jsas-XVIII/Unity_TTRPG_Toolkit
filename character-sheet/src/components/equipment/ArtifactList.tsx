import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Artifact } from '../../types/equipment'
import type { Dispatch } from 'react'
import { REMOVE_BTN } from '../../styles/classes'

type Action =
  | { type: 'ADD_ARTIFACT'; artifact: Artifact }
  | { type: 'REMOVE_ARTIFACT'; id: string }
  | { type: 'TOGGLE_ARTIFACT_EQUIPPED'; id: string }
  | { type: 'UPDATE_ARTIFACT_DESCRIPTION'; id: string; description: string }

interface Props {
  artifacts: Artifact[]
  artifactCapacity: number
  dispatch: Dispatch<Action>
}

export default function ArtifactList({ artifacts, artifactCapacity, dispatch }: Props) {
  const [newName, setNewName] = useState('')
  const equippedCount = artifacts.filter((a) => a.equipped).length
  const overCapacity = equippedCount > artifactCapacity

  function addArtifact() {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_ARTIFACT',
      artifact: { id: uuidv4(), name: newName.trim(), description: '', equipped: false },
    })
    setNewName('')
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs text-gray-500 uppercase">Artifacts</p>
        <span
          className={`text-xs px-1.5 rounded ${overCapacity ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-500'}`}
        >
          {equippedCount}/{artifactCapacity} equipped {overCapacity && '⚠ Hindrance!'}
        </span>
      </div>

      {artifacts.map((a) => (
        <div key={a.id} className="bg-gray-800 rounded px-3 py-2 mb-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={a.equipped}
              onChange={() => dispatch({ type: 'TOGGLE_ARTIFACT_EQUIPPED', id: a.id })}
              className="accent-amber-500"
              title="Equipped"
            />
            <span
              className={`flex-1 text-sm ${a.equipped ? 'text-amber-300 font-semibold' : 'text-gray-400'}`}
            >
              {a.name}
            </span>
            <button
              className={REMOVE_BTN}
              onClick={() => dispatch({ type: 'REMOVE_ARTIFACT', id: a.id })}
            >
              ✕
            </button>
          </div>
          <input
            type="text"
            className="mt-1 w-full bg-transparent text-xs text-gray-500 placeholder-gray-700 focus:outline-none focus:text-gray-300"
            value={a.description}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_ARTIFACT_DESCRIPTION',
                id: a.id,
                description: e.target.value,
              })
            }
            placeholder="Description…"
          />
        </div>
      ))}

      <div className="flex gap-2 mt-1">
        <input
          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addArtifact()}
          placeholder="Artifact name…"
        />
        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs text-gray-300"
          onClick={addArtifact}
        >
          Add
        </button>
      </div>
    </div>
  )
}
