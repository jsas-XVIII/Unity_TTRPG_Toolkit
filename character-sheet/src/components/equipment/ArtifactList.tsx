import { useState } from 'react'
import type { Dispatch } from 'react'
import type { CharacterArtifact, ArtifactEffectKind } from '../../types/artifact'
import { getAllArtifacts, getArtifactById } from '../../data/artifactsData'
import { REMOVE_BTN } from '../../styles/classes'

type Action =
  | { type: 'EQUIP_ARTIFACT'; id: string }
  | { type: 'UNEQUIP_ARTIFACT'; id: string }
  | { type: 'TOGGLE_ARTIFACT_UPGRADE'; artifactId: string; upgradeId: string }

interface Props {
  equippedArtifacts: CharacterArtifact[]
  artifactCapacity: number
  dispatch: Dispatch<Action>
}

function kindColor(kind: ArtifactEffectKind): string {
  if (kind === 'Passive') return 'bg-gray-600 text-gray-200'
  if (kind === 'Standard') return 'bg-blue-900 text-blue-300'
  if (kind === 'Quick') return 'bg-green-900 text-green-300'
  if (kind === 'Reaction') return 'bg-purple-900 text-purple-300'
  if (kind === 'Set Bonus') return 'bg-amber-900 text-amber-300'
  if (kind === 'Movement') return 'bg-cyan-900 text-cyan-300'
  return 'bg-red-900 text-red-300' // Passage
}

export default function ArtifactList({ equippedArtifacts, artifactCapacity, dispatch }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const allArtifacts = getAllArtifacts()
  const equippedSet = new Set(equippedArtifacts.map((a) => a.id))
  const unequippedArtifacts = allArtifacts.filter((a) => !equippedSet.has(a.id))
  const overCapacity = equippedArtifacts.length > artifactCapacity

  const equippedSetIds = new Set(
    equippedArtifacts
      .map((ca) => getArtifactById(ca.id)?.setId)
      .filter((id): id is string => id !== undefined)
  )
  const completeSets = new Set(
    [...equippedSetIds].filter((setId) =>
      allArtifacts.filter((a) => a.setId === setId).every((a) => equippedSet.has(a.id))
    )
  )

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs text-gray-500 uppercase">Artifacts</p>
        <span
          className={`text-xs px-1.5 rounded ${overCapacity ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-500'}`}
        >
          {equippedArtifacts.length}/{artifactCapacity} equipped
          {overCapacity && ' ⚠ Hindrance to ALL actions!'}
        </span>
      </div>

      {equippedArtifacts.map((charArtifact) => {
        const artifact = getArtifactById(charArtifact.id)
        if (!artifact) return null
        const expanded = expandedIds.has(charArtifact.id)

        return (
          <div key={charArtifact.id} className="bg-gray-800 rounded px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <button
                className="flex-1 flex items-center gap-1.5 text-left min-w-0"
                onClick={() => toggleExpanded(charArtifact.id)}
              >
                <span className="text-sm text-amber-300 font-semibold truncate">
                  {artifact.name}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{artifact.subtype}</span>
                {artifact.setId && completeSets.has(artifact.setId) && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300 shrink-0">
                    Set Active
                  </span>
                )}
                <span className="ml-auto text-gray-400 shrink-0 text-xs">
                  {expanded ? '▲' : '▼'}
                </span>
              </button>
              <button
                className={REMOVE_BTN}
                onClick={() => dispatch({ type: 'UNEQUIP_ARTIFACT', id: charArtifact.id })}
                title="Unequip"
              >
                ✕
              </button>
            </div>

            {expanded && (
              <div className="mt-2 space-y-2">
                {artifact.effects.map((effect, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-semibold text-gray-300">{effect.name}</span>
                      <span className={`text-xs px-1 rounded ${kindColor(effect.kind)}`}>
                        {effect.kind}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{effect.description}</p>
                  </div>
                ))}

                {artifact.upgrades && artifact.upgrades.length > 0 && (
                  <div className="border-t border-gray-700 pt-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Upgrades</p>
                    {artifact.upgrades.map((upgrade) => {
                      const purchased = charArtifact.purchasedUpgradeIds.includes(upgrade.id)
                      return (
                        <label
                          key={upgrade.id}
                          className="flex items-start gap-2 mb-1.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={purchased}
                            onChange={() =>
                              dispatch({
                                type: 'TOGGLE_ARTIFACT_UPGRADE',
                                artifactId: charArtifact.id,
                                upgradeId: upgrade.id,
                              })
                            }
                            className="accent-amber-500 mt-0.5 shrink-0"
                          />
                          <div>
                            <span
                              className={`text-xs font-semibold ${purchased ? 'text-amber-300' : 'text-gray-200'}`}
                            >
                              {upgrade.name}
                            </span>
                            <p className="text-xs text-gray-300 leading-relaxed">
                              {upgrade.description}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {unequippedArtifacts.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) dispatch({ type: 'EQUIP_ARTIFACT', id: e.target.value })
          }}
          className="w-full mt-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
        >
          <option value="">— Equip artifact —</option>
          {unequippedArtifacts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.subtype})
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
