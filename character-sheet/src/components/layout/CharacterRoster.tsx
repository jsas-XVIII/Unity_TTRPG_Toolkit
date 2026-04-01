// CharacterRoster.tsx — displays all saved characters and lets the user load or delete one.
// Fetches the lightweight CharacterSummary list on mount (no full character data until selected).
// Handles three states: loading, empty, and populated.
//
// Delete uses inline confirmation: clicking Delete on a card puts that card into a
// "pending delete" state showing Yes / Cancel, so accidental deletions are prevented
// without needing a separate modal.

import { useState, useEffect } from 'react'
import type { CharacterSummary } from '../../types/character'
import type { CharacterRepository } from '../../services/api'

interface Props {
  api: CharacterRepository
  onSelect: (id: string) => void
  onBack: () => void
}

export default function CharacterRoster({ api, onSelect, onBack }: Props) {
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
  const [loading, setLoading] = useState(true)

  // Tracks which character (by id) is awaiting delete confirmation.
  // Only one card can be in confirmation state at a time.
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // Load the character list once when the roster mounts
  useEffect(() => {
    api.getAll().then((all) => {
      setCharacters(all)
      setLoading(false)
    })
  }, [api])

  async function handleDelete(id: string) {
    await api.delete(id)
    // Remove from local state immediately — no need to re-fetch
    setCharacters((prev) => prev.filter((c) => c.id !== id))
    setPendingDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          >
            ← Back
          </button>
          <h2 className="text-lg font-bold text-gray-100">Your Characters</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8">
        {loading && (
          <p className="text-gray-500 text-sm">Loading…</p>
        )}

        {!loading && characters.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
            <p className="text-gray-400">No characters saved yet.</p>
            <button
              onClick={onBack}
              className="px-5 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold"
            >
              Create your first character
            </button>
          </div>
        )}

        {!loading && characters.length > 0 && (
          <ul className="flex flex-col gap-3">
            {characters.map((c) => (
              <li key={c.id}>
                {/* Confirmation state — shown when the user clicks Delete on this card */}
                {pendingDeleteId === c.id ? (
                  <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-gray-900 border border-red-800">
                    <span className="text-sm text-gray-300">
                      Delete <span className="font-semibold text-gray-100">{c.name}</span>? This cannot be undone.
                    </span>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white text-sm font-semibold"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(null)}
                        className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Default state — load button + separate delete button
                  <div className="flex items-center gap-2 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 transition-all pr-3">
                    {/* Clickable area for loading the character — takes up most of the card */}
                    <button
                      onClick={() => onSelect(c.id)}
                      className="flex-1 text-left px-5 py-4"
                    >
                      <span className="block text-base font-bold text-gray-100">{c.name}</span>
                      <span className="block text-sm text-gray-400 mt-0.5">
                        {c.className} · {c.race} · Level {c.level}
                      </span>
                    </button>

                    {/* Delete button — isolated so it doesn't trigger onSelect */}
                    <button
                      onClick={() => setPendingDeleteId(c.id)}
                      aria-label={`Delete ${c.name}`}
                      className="shrink-0 px-3 py-1.5 rounded bg-gray-800 hover:bg-red-900 hover:text-red-300 text-gray-500 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
