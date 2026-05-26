import { useState } from 'react'
import type { Perk } from '../../../types/character'
import { FORM_INPUT, FORM_LABEL } from '../../../styles/classes'
import ConfirmButton from '../../ui/ConfirmButton'

interface Props {
  initial: Perk
  isOfficial: boolean
  isOverridden: boolean
  readOnly?: boolean
  onSave: (perk: Perk) => void
  onReset?: () => void
  onDelete?: () => void
  onCancel: () => void
}

// Create/edit/view form for a GM perk definition.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL; swapped inline confirm state for ConfirmButton
export default function PerkEditorForm({
  initial,
  isOfficial,
  isOverridden,
  readOnly = false,
  onSave,
  onReset,
  onDelete,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const isNew = !isOfficial && !isOverridden

  function handleSave() {
    if (!name.trim()) return
    onSave({ ...initial, name: name.trim(), description: description.trim() })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
        >
          ← {readOnly ? 'Back' : 'Cancel'}
        </button>
        <h1 className="text-xl font-bold text-gray-100">
          {isNew ? 'New Perk' : readOnly ? `View: ${initial.name}` : `Edit: ${initial.name}`}
        </h1>
        {isOfficial && !isOverridden && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">
            Official
          </span>
        )}
        {isOverridden && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900 text-amber-300">
            Overridden
          </span>
        )}
      </div>

      <div className="space-y-4">
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div>
            <label className={FORM_LABEL}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
              className={FORM_INPUT}
              placeholder="Perk name"
            />
          </div>
          <div>
            <label className={FORM_LABEL}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={readOnly}
              rows={4}
              className={`${FORM_INPUT} resize-none`}
              placeholder="Perk description"
            />
          </div>
        </section>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {isOfficial && !isOverridden ? 'Save as Override' : 'Save'}
            </button>

            {isOverridden && onReset && (
              <ConfirmButton
                triggerLabel="Reset to Default"
                promptText="Reset to official?"
                confirmLabel="Confirm Reset"
                onConfirm={onReset}
                triggerClassName="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
              />
            )}

            {!isOfficial && onDelete && (
              <ConfirmButton
                triggerLabel="Delete"
                promptText="Delete this perk?"
                confirmLabel="Confirm Delete"
                onConfirm={onDelete}
                triggerClassName="text-xs px-3 py-1.5 rounded border border-red-900 text-red-400 hover:border-red-700 hover:text-red-300 transition-colors ml-auto"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
