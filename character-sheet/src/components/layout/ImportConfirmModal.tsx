// ImportConfirmModal.tsx — confirmation dialog shown after a successful JSON import.
// Gives the user the choice to switch to the imported character or stay on the current screen.
// Rendered as a full-screen overlay so it works on top of any view.

import type { Character } from '../../types/character'

interface Props {
  character: Character
  onConfirm: () => void
  onDismiss: () => void
}

export default function ImportConfirmModal({ character, onConfirm, onDismiss }: Props) {
  return (
    // Semi-transparent backdrop — clicking it dismisses the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onDismiss}
    >
      {/* Card — stop click events propagating to the backdrop */}
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
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
      </div>
    </div>
  )
}
