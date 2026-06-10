import { useState } from 'react'
import type { Campaign, CampaignNote } from '../../types/campaign'
import {
  getCampaigns,
  upsertCampaign,
  deleteCampaign,
  ACTIVE_CAMPAIGN_KEY,
} from '../../services/campaignStorage'
import { uid } from '../../utils/idGenerator'
import { isQuotaError } from '../../utils/storageErrors'
import StorageErrorToast from '../ui/StorageErrorToast'
import RuinWidget from './RuinWidget'
import DiceTrayModal from '../dice/DiceTrayModal'
import type { DerivedStats } from '../../utils/derivedStats'
import type { Character } from '../../types/character'

// Stub passed to DiceTrayModal so it works without a real character.
// GM rolls are stored under 'unity_ttrpg_roll_history_gm', separate from all characters.
const GM_CHARACTER_STUB: Pick<Character, 'id' | 'attributes'> = {
  id: 'gm',
  attributes: { might: 0, agility: 0, mind: 0, presence: 0 },
}
const GM_DERIVED_STUB: DerivedStats = {
  ar: 0,
  dr: 0,
  mr: 0,
  speed: 0,
  av: 0,
  maxHp: 0,
  maxRecuperations: 0,
  hl: 0,
}

interface Props {
  onBack: () => void
  onNavigateToEncounter: () => void
  onCampaignChange: (campaignId: string | null) => void
}

export default function GMScreen({ onBack, onNavigateToEncounter, onCampaignChange }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => getCampaigns())
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_CAMPAIGN_KEY)
  )
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [creatingCampaign, setCreatingCampaign] = useState(false)
  const [showDice, setShowDice] = useState(false)
  const [storageError, setStorageError] = useState(false)
  // Local note title/content state so edits feel immediate even though saves are on blur.
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) ?? null
  const activeNote = activeCampaign?.notes.find((n) => n.id === activeNoteId) ?? null

  function selectCampaign(id: string | null) {
    setActiveCampaignId(id)
    setActiveNoteId(null)
    if (id) {
      localStorage.setItem(ACTIVE_CAMPAIGN_KEY, id)
    } else {
      localStorage.removeItem(ACTIVE_CAMPAIGN_KEY)
    }
    onCampaignChange(id)
  }

  function createCampaign() {
    const name = newCampaignName.trim()
    if (!name) return
    const campaign: Campaign = { id: `camp-${uid()}`, name, ruin: 0, notes: [] }
    try {
      upsertCampaign(campaign)
      const updated = getCampaigns()
      setCampaigns(updated)
      setNewCampaignName('')
      setCreatingCampaign(false)
      selectCampaign(campaign.id)
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  function handleDeleteCampaign(id: string) {
    deleteCampaign(id)
    setCampaigns(getCampaigns())
    if (activeCampaignId === id) selectCampaign(null)
  }

  function saveCampaign(updated: Campaign) {
    try {
      upsertCampaign(updated)
      setCampaigns(getCampaigns())
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  function handleRuinUpdate(updated: Campaign) {
    saveCampaign(updated)
  }

  function createNote() {
    if (!activeCampaign) return
    const note: CampaignNote = { id: `note-${uid()}`, title: 'New Note', content: '' }
    const updated = { ...activeCampaign, notes: [...activeCampaign.notes, note] }
    saveCampaign(updated)
    setActiveNoteId(note.id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }

  function deleteNote(noteId: string) {
    if (!activeCampaign) return
    const updated = {
      ...activeCampaign,
      notes: activeCampaign.notes.filter((n) => n.id !== noteId),
    }
    saveCampaign(updated)
    if (activeNoteId === noteId) setActiveNoteId(null)
  }

  // Saves note title on blur — avoids a localStorage write on every keystroke.
  function handleNoteTitleBlur(noteId: string, title: string) {
    if (!activeCampaign) return
    const updated = {
      ...activeCampaign,
      notes: activeCampaign.notes.map((n) => (n.id === noteId ? { ...n, title } : n)),
    }
    saveCampaign(updated)
  }

  // Saves note content on blur.
  function handleNoteContentBlur(noteId: string, content: string) {
    if (!activeCampaign) return
    const updated = {
      ...activeCampaign,
      notes: activeCampaign.notes.map((n) => (n.id === noteId ? { ...n, content } : n)),
    }
    saveCampaign(updated)
  }

  function selectNote(noteId: string) {
    const note = activeCampaign?.notes.find((n) => n.id === noteId)
    setActiveNoteId(noteId)
    setNoteTitle(note?.title ?? '')
    setNoteContent(note?.content ?? '')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
      {showDice && (
        <DiceTrayModal
          character={GM_CHARACTER_STUB as Character}
          derived={GM_DERIVED_STUB}
          onClose={() => setShowDice(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-100 flex-1">GM Screen</h1>
          <button
            onClick={onNavigateToEncounter}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            Encounter Builder →
          </button>
          <button
            onClick={() => setShowDice(true)}
            className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
          >
            Dice
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Campaign selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 uppercase tracking-wide shrink-0">Campaign</span>

          {campaigns.length > 0 ? (
            <select
              value={activeCampaignId ?? ''}
              onChange={(e) => selectCampaign(e.target.value || null)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500 flex-1 min-w-0"
            >
              <option value="">— Select campaign —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-gray-500 italic">No campaigns yet.</span>
          )}

          {!creatingCampaign && (
            <button
              onClick={() => setCreatingCampaign(true)}
              className="text-xs px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors shrink-0"
            >
              + New
            </button>
          )}

          {activeCampaignId && (
            <button
              onClick={() => handleDeleteCampaign(activeCampaignId)}
              className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-500 hover:border-red-700 hover:text-red-400 transition-colors shrink-0"
            >
              Delete
            </button>
          )}
        </div>

        {/* New campaign inline form */}
        {creatingCampaign && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') createCampaign()
                if (e.key === 'Escape') setCreatingCampaign(false)
              }}
              placeholder="Campaign name…"
              autoFocus
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={createCampaign}
              disabled={!newCampaignName.trim()}
              className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setCreatingCampaign(false)}
              className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {activeCampaign ? (
          <div className="flex flex-col gap-6">
            {/* Ruin tracker */}
            <RuinWidget campaign={activeCampaign} onUpdate={handleRuinUpdate} />

            {/* Notes panel */}
            <div className="flex gap-4 flex-1">
              {/* Note list */}
              <div className="w-44 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Notes</span>
                  <button
                    onClick={createNote}
                    className="text-xs text-amber-500 hover:text-amber-300 transition-colors"
                  >
                    + New
                  </button>
                </div>
                {activeCampaign.notes.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">No notes yet.</p>
                ) : (
                  <div className="space-y-1">
                    {activeCampaign.notes.map((note) => (
                      <div
                        key={note.id}
                        className={`flex items-center gap-1 rounded px-2 py-1.5 cursor-pointer group transition-colors ${
                          activeNoteId === note.id
                            ? 'bg-gray-800 text-gray-100'
                            : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                        }`}
                        onClick={() => selectNote(note.id)}
                      >
                        <span className="flex-1 text-xs truncate">{note.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-sm leading-none transition-all"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note editor */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                {activeNote ? (
                  <>
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      onBlur={() => handleNoteTitleBlur(activeNote.id, noteTitle)}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-semibold text-gray-100 focus:outline-none focus:border-amber-500"
                    />
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      onBlur={() => handleNoteContentBlur(activeNote.id, noteContent)}
                      placeholder="Session notes…"
                      className="flex-1 min-h-64 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-amber-500 resize-y leading-relaxed"
                    />
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-sm italic">
                    Select a note or create a new one.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-sm">Select a campaign or create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
