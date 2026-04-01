// App.tsx — root of the React application.
// Owns top-level state: which view is active (wizard vs sheet) and the current character.
// All persistence calls (create / update) flow through the `api` hook so the same
// code works whether the backend is localStorage (Phase 1) or a C# REST API (Phase 2).

import { useState } from 'react'
import CharacterSheet from './components/layout/CharacterSheet'
import CharacterWizard from './components/wizard/CharacterWizard'
import type { Character } from './types/character'
import { useApi } from './hooks/useApi'

type View = 'wizard' | 'sheet'

export default function App() {
  // useApi returns either localStorageRepository or restApiRepository depending on VITE_USE_API env var
  const api = useApi()

  // Controls which top-level screen is shown
  const [view, setView] = useState<View>('wizard')

  // The active character; null until the wizard completes or a character is imported
  const [character, setCharacter] = useState<Character | null>(null)

  // Drives the temporary save/error toast in the top-right corner
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Called when the New Character wizard finishes its final step.
  // Persists the new character and transitions to the sheet view.
  async function handleWizardComplete(newChar: Character) {
    try {
      const created = await api.create(newChar)
      setCharacter(created)
      setView('sheet')
    } catch {
      // LocalStorage create shouldn't fail, but handle gracefully
      setCharacter(newChar)
      setView('sheet')
    }
  }

  // Called by the Save button on the character sheet.
  // Attempts an update first; falls back to create if the character isn't in storage yet.
  async function handleSave(c: Character) {
    try {
      setCharacter(c)
      await api.update(c.id, c).catch(async () => {
        const created = await api.create(c)
        setCharacter(created)
      })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  // Called by the Export JSON button.
  // Serialises the character to a .json file and triggers a browser download — no server involved.
  function handleExport(c: Character) {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${c.name.replace(/\s+/g, '_')}_character.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Called by the Import JSON button with the selected File object.
  // Reads the file as text, parses the JSON, then saves it as a new character entry
  // (api.create always assigns a fresh UUID, so importing never overwrites an existing record).
  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        const created = await api.create(parsed)
        setCharacter(created)
        setView('sheet')
      } catch {
        setSaveStatus('error')
      }
    }
    reader.readAsText(file)
  }

  // Returns to the wizard so the user can create a new character without losing the current one in storage
  function handleNewCharacter() {
    setView('wizard')
  }

  if (view === 'wizard') {
    return (
      <CharacterWizard
        onComplete={handleWizardComplete}
        onCancel={character ? () => setView('sheet') : () => {}}
      />
    )
  }

  if (!character) return null

  return (
    <>
      {/* Save confirmation toast */}
      {saveStatus === 'saved' && (
        <div className="fixed top-4 right-4 bg-green-800 text-green-200 px-4 py-2 rounded shadow-lg z-50 text-sm">
          Character saved!
        </div>
      )}
      {/* Save error toast */}
      {saveStatus === 'error' && (
        <div className="fixed top-4 right-4 bg-red-800 text-red-200 px-4 py-2 rounded shadow-lg z-50 text-sm">
          Save failed.
        </div>
      )}
      <CharacterSheet
        initial={character}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onNewCharacter={handleNewCharacter}
      />
    </>
  )
}
