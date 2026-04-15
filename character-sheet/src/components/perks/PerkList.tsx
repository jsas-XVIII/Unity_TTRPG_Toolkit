import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Perk } from '../../types/character'
import type { Dispatch } from 'react'
import { GENERAL_PERKS } from '../../constants/perks'
import { CARD, SECTION_HEADING, REMOVE_BTN } from '../../styles/classes'
import { ADVANCEMENT_ROWS } from '../../data/advancementData'
import GeneralPerkModal from './GeneralPerkModal'

type Action = { type: 'ADD_PERK'; perk: Perk } | { type: 'REMOVE_PERK'; id: string }

interface Props {
  perks: Perk[]
  level: number
  dispatch: Dispatch<Action>
}

function perkColor(used: number, max: number): string {
  if (used > max) return 'text-red-400'
  if (used === max) return 'text-green-400'
  return 'text-yellow-400'
}

export default function PerkList({ perks, level, dispatch }: Props) {
  const [showModal, setShowModal] = useState(false)

  const classPerks = perks.filter((p) => p.source === 'Class')
  const generalPerks = perks.filter((p) => p.source === 'General')
  const maxGeneralPerks = ADVANCEMENT_ROWS.filter(
    (row) => row.level <= level && row.generalPerk
  ).length

  function addGeneralPerk(perkName: string) {
    const template = GENERAL_PERKS.find((p) => p.name === perkName)
    if (!template) return
    dispatch({ type: 'ADD_PERK', perk: { ...template, id: uuidv4() } })
  }

  function addCustomPerk() {
    dispatch({
      type: 'ADD_PERK',
      perk: { id: uuidv4(), name: 'New Perk', description: '', source: 'Class' },
    })
  }

  function PerkRow({ perk }: { perk: Perk }) {
    return (
      <div className="flex items-start gap-2 py-1.5 border-b border-gray-800 last:border-0">
        <div className="flex-1">
          <span className="text-sm font-semibold text-white">{perk.name}</span>
          {perk.description && <p className="text-xs text-gray-400 mt-0.5">{perk.description}</p>}
        </div>
        <button
          className={REMOVE_BTN}
          onClick={() => dispatch({ type: 'REMOVE_PERK', id: perk.id })}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={CARD}>
        {/* Class Perks */}
        <h2 className={SECTION_HEADING}>Class Perks</h2>
        <div className="mb-1">
          {classPerks.length > 0 ? (
            classPerks.map((p) => <PerkRow key={p.id} perk={p} />)
          ) : (
            <p className="text-xs text-gray-600 italic">No class perks added.</p>
          )}
        </div>
        <button
          className="mt-2 w-full py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm transition-colors"
          onClick={addCustomPerk}
        >
          + Add Class Perk
        </button>

        {/* General Perks */}
        <div className="flex justify-between items-center mt-4">
          <h2 className={SECTION_HEADING}>General Perks</h2>
          <span className="text-xs text-gray-500">
            <span className={perkColor(generalPerks.length, maxGeneralPerks)}>
              {generalPerks.length}/{maxGeneralPerks}
            </span>
          </span>
        </div>
        <div className="mb-2">
          {generalPerks.length > 0 ? (
            generalPerks.map((p) => <PerkRow key={p.id} perk={p} />)
          ) : (
            <p className="text-xs text-gray-600 italic">No general perks added.</p>
          )}
        </div>
        <button
          className="w-full py-1.5 rounded border border-dashed border-gray-600 text-gray-500 hover:text-gray-300 hover:border-gray-400 text-sm transition-colors"
          onClick={() => setShowModal(true)}
        >
          + Add General Perk
        </button>
      </div>

      {showModal && <GeneralPerkModal onAdd={addGeneralPerk} onClose={() => setShowModal(false)} />}
    </>
  )
}
