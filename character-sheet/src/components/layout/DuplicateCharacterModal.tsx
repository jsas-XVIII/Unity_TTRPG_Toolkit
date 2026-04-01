// DuplicateCharacterModal.tsx — shown when an imported character's id already
// exists in storage. Gives the user the choice to import as a new copy
// (with a fresh id and " - copy" appended to the name) or cancel entirely.

import type { Character } from '../../types/character'

interface Props {
  character: Character  // the incoming character from the file
  onConfirm: () => void // create a copy
  onDismiss: () => void // cancel — do nothing
}

export default function DuplicateCharacterModal({ character, onConfirm, onDismiss }: Props) {
  return (
    // Semi-transparent backdrop — clicking it dismisses the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onDismiss}
    >
      {/* Card — stop clicks propagating to the backdrop */}
      <div
        className="bg-gray-900 border border-yellow-800 rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1">
          Already Saved
        </p>
        <h2 className="text-xl font-bold text-gray-100 mb-1">{character.name}</h2>
        <p className="text-sm text-gray-400 mb-1">
          {character.className} · {character.race} · Level {character.level}
        </p>

        <p className="text-sm text-gray-300 mt-4 mb-1">
          This character is already saved in your browser.
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Do you want to import it as a copy?{' '}
          <span className="text-gray-300 font-medium">
            "{character.name} - copy"
          </span>{' '}
          will be created as a separate character.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white font-semibold text-sm"
            onClick={onConfirm}
          >
            Create Copy
          </button>
          <button
            className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
            onClick={onDismiss}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
