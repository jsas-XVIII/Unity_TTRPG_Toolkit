import { useState } from 'react'
import type { Perk } from '../../../types/character'

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

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500'
const labelCls = 'block text-xs text-gray-400 mb-1'

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
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={readOnly}
              className={inputCls}
              placeholder="Perk name"
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              readOnly={readOnly}
              rows={4}
              className={`${inputCls} resize-none`}
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
              <>
                {confirmReset ? (
                  <>
                    <span className="text-xs text-gray-400">Reset to official?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onReset()
                        setConfirmReset(false)
                      }}
                      className="text-xs px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white transition-colors"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                  >
                    Reset to Default
                  </button>
                )}
              </>
            )}

            {!isOfficial && onDelete && (
              <>
                {confirmDelete ? (
                  <>
                    <span className="text-xs text-gray-400">Delete this perk?</span>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="text-xs px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs px-3 py-1.5 rounded border border-red-900 text-red-400 hover:border-red-700 hover:text-red-300 transition-colors ml-auto"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
