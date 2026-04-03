import type { ClassResource, SecondaryResource } from '../../types/character'
import type { Dispatch } from 'react'
import { CARD, SECTION_HEADING } from '../../styles/classes'

type Action =
  | { type: 'SET_PRIMARY_RESOURCE'; current: number }
  | { type: 'SET_SECONDARY_RESOURCE'; current: number }

interface Props {
  primary: ClassResource
  secondary: SecondaryResource | null
  dispatch: Dispatch<Action>
}

function Pips({
  current,
  max,
  onSet,
}: {
  current: number
  max: number
  onSet: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSet(current === i + 1 ? i : i + 1)}
          className={`w-6 h-6 rounded-full border transition-colors ${
            i < current ? 'bg-amber-500 border-amber-400' : 'bg-gray-800 border-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

export default function ResourceTracker({ primary, secondary, dispatch }: Props) {
  return (
    <div className={CARD}>
      <h2 className={SECTION_HEADING}>Resources</h2>

      <div className="mb-3">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-semibold text-amber-400">{primary.name}</span>
          <span className="text-xs text-gray-400">
            {primary.current} / {primary.max} · {primary.rechargeDie}
          </span>
        </div>
        <Pips
          current={primary.current}
          max={primary.max}
          onSet={(v) => dispatch({ type: 'SET_PRIMARY_RESOURCE', current: v })}
        />
      </div>

      {secondary && (
        <div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-blue-400">{secondary.name}</span>
            <span className="text-xs text-gray-400">
              {secondary.current} / {secondary.max}
            </span>
          </div>
          <Pips
            current={secondary.current}
            max={secondary.max}
            onSet={(v) => dispatch({ type: 'SET_SECONDARY_RESOURCE', current: v })}
          />
        </div>
      )}
    </div>
  )
}
