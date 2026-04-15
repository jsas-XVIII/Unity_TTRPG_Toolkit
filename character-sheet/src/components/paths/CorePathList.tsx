import { v4 as uuidv4 } from 'uuid'
import type { CorePath } from '../../types/character'
import type { Dispatch } from 'react'
import CorePathEntry from './CorePathEntry'
import { CARD } from '../../styles/classes'
import { ADVANCEMENT_ROWS } from '../../data/advancementData'

const STARTING_PATH_POINTS = 5

type Action =
  | { type: 'SET_CORE_PATH'; path: CorePath }
  | { type: 'ADD_CORE_PATH'; path: CorePath }
  | { type: 'REMOVE_CORE_PATH'; id: string }

interface Props {
  corePaths: CorePath[]
  level: number
  dispatch: Dispatch<Action>
}

function pointsColor(used: number, max: number): string {
  if (used > max) return 'text-red-400'
  if (used === max) return 'text-green-400'
  return 'text-yellow-400'
}

export default function CorePathList({ corePaths, level, dispatch }: Props) {
  const totalPoints = corePaths.reduce((s, p) => s + p.points, 0)
  const pointsFromLeveling = ADVANCEMENT_ROWS.filter(
    (row) => row.level <= level && row.corePathPoint
  ).length
  const maxPoints = STARTING_PATH_POINTS + pointsFromLeveling

  function addPath() {
    dispatch({
      type: 'ADD_CORE_PATH',
      path: { id: uuidv4(), name: '', description: '', points: 1 },
    })
  }

  return (
    <div className={CARD}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Paths</h2>
        <span className="text-xs text-gray-500">
          Pts:{' '}
          <span className={pointsColor(totalPoints, maxPoints)}>
            {totalPoints}/{maxPoints}
          </span>
        </span>
      </div>

      <div className="space-y-2">
        {corePaths.map((path) => (
          <CorePathEntry key={path.id} path={path} dispatch={dispatch} />
        ))}
      </div>

      <button
        className="mt-3 w-full py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm transition-colors"
        onClick={addPath}
      >
        + Add Core Path
      </button>
    </div>
  )
}
