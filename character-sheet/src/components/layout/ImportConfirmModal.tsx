// ImportConfirmModal.tsx — confirmation dialog shown after a successful JSON import.
// Gives the user the choice to switch to the imported character or stay on the current screen.
// Rendered as a full-screen overlay so it works on top of any view.

import type { Character } from '../../types/character'
import Modal from '../ui/Modal'

interface Props {
  character: Character
  onConfirm: () => void
  onDismiss: () => void
}

// Confirmation dialog shown after a successful JSON import; offers to switch to the new character.
// [JSas | 2026-05-25] Modified: replaced inline overlay markup with shared Modal component
export default function ImportConfirmModal({ character, onConfirm, onDismiss }: Props) {
  return (
    <Modal onClose={onDismiss} className="border border-gray-700 p-6 max-w-sm">
      {/* Header */}
      <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">
        Import Successful
      </p>
      <h2 className="text-xl font-bold text-gray-100 mb-1">{character.name}</h2>
      <p className="text-sm text-gray-400 mb-1">
        {character.className} · {character.race} · Level {character.level}
      </p>

      <p className="text-sm text-gray-300 mt-4 mb-6">
        Do you want to switch to this character now?
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          className="flex-1 px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold text-sm"
          onClick={onConfirm}
        >
          Switch to {character.name}
        </button>
        <button
          className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          onClick={onDismiss}
        >
          Stay Here
        </button>
      </div>
    </Modal>
  )
}
