// DuplicateCharacterModal.tsx — shown when an imported character's id already
// exists in storage. Gives the user the choice to import as a new copy
// (with a fresh id and " - copy" appended to the name) or cancel entirely.

import type { Character } from '../../types/character'
import Modal from '../ui/Modal'

interface Props {
  character: Character // the incoming character from the file
  onConfirm: () => void // create a copy
  onDismiss: () => void // cancel — do nothing
}

// Shown when an imported character's ID already exists; lets the user create a copy or cancel.
// [JSas | 2026-05-25] Modified: replaced inline overlay markup with shared Modal component
export default function DuplicateCharacterModal({ character, onConfirm, onDismiss }: Props) {
  return (
    <Modal onClose={onDismiss} className="border border-yellow-800 p-6 max-w-sm">
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
        <span className="text-gray-300 font-medium">"{character.name} - copy"</span> will be created
        as a separate character.
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
    </Modal>
  )
}
