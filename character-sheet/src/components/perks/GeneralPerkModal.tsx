// GeneralPerkModal.tsx — modal perk picker for selecting a General Perk.
// Shows all available perks with descriptions so the player can browse before committing.

import { useState } from 'react'
import Modal from '../ui/Modal'
import { getAllPerks } from '../../data/perksData'

interface Props {
  onAdd: (perkName: string) => void
  onClose: () => void
}

// Scrollable perk-picker modal; lets the player browse all perks before selecting one.
// [JSas | 2026-05-25] Modified: replaced inline overlay markup with shared Modal component
export default function GeneralPerkModal({ onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleAdd() {
    if (selected) {
      onAdd(selected)
      onClose()
    }
  }

  return (
    <Modal
      onClose={onClose}
      className="border border-gray-700 p-6 max-w-md flex flex-col max-h-[80vh]"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
        General Perks
      </p>
      <h2 className="text-lg font-bold text-gray-100 mb-4">Choose a Perk</h2>

      {/* Scrollable perk list */}
      <div className="overflow-y-auto flex-1 space-y-2 pr-1">
        {getAllPerks().map((perk) => (
          <button
            key={perk.name}
            onClick={() => setSelected(perk.name)}
            className={`w-full text-left rounded-lg border p-3 transition-colors ${
              selected === perk.name
                ? 'border-amber-500 bg-amber-900/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <p className="text-sm font-semibold text-gray-100">{perk.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{perk.description}</p>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
        <button
          className="flex-1 px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          onClick={handleAdd}
          disabled={!selected}
        >
          {selected ? `Add ${selected}` : 'Select a Perk'}
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}
