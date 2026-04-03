import type { CharacterPower } from '../../types/character'
import type { ClassName } from '../../data/powersData'
import type { Dispatch } from 'react'
import { getPowerById } from '../../data/powersData'
import PowerReferenceCard from './PowerReferenceCard'

type Action =
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }

interface Props {
  power: CharacterPower
  className: ClassName
  dispatch: Dispatch<Action>
}

export default function PowerCard({ power, className, dispatch }: Props) {
  const resolved = getPowerById(power.id)

  if (!resolved) {
    return (
      <div className="w-64 rounded border-2 border-red-900 bg-red-950 p-3 text-red-400 text-xs">
        <p className="font-bold mb-1">Power not found</p>
        <p className="text-red-500/70 mb-2">ID: {power.id}</p>
        <button
          className="text-red-400 hover:text-red-300 underline"
          onClick={() => dispatch({ type: 'REMOVE_POWER', id: power.id })}
        >
          Remove
        </button>
      </div>
    )
  }

  // Overlay purchased state from CharacterPower onto the resolved power's upgrades
  const resolvedPower = {
    ...resolved.power,
    upgrades: resolved.power.upgrades.map((u) => ({
      ...u,
      purchased: power.purchasedUpgradeIds.includes(u.id),
    })),
  }

  return (
    <PowerReferenceCard
      power={resolvedPower}
      className={className}
      onRemove={() => dispatch({ type: 'REMOVE_POWER', id: power.id })}
      onUpgradeToggle={(upgradeId) =>
        dispatch({ type: 'TOGGLE_UPGRADE', powerId: power.id, upgradeId })
      }
    />
  )
}
