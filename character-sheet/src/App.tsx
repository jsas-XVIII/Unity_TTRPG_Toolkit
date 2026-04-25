// App.tsx — root of the React application.
// Owns top-level state: which view is active and the current character.
// All persistence calls (create / update) flow through the `api` hook so the same
// code works whether the backend is localStorage (Phase 1) or a C# REST API (Phase 2).

import { useState } from 'react'
import HomeScreen from './components/layout/HomeScreen'
import CharacterRoster from './components/layout/CharacterRoster'
import CharacterSheet from './components/layout/CharacterSheet'
import CharacterWizard from './components/wizard/CharacterWizard'
import GMDashboard from './components/gm/GMDashboard'
import ImportConfirmModal from './components/layout/ImportConfirmModal'
import DuplicateCharacterModal from './components/layout/DuplicateCharacterModal'
import type { Character } from './types/character'
import { useApi } from './hooks/useApi'
import { useImportFlow } from './hooks/useImportFlow'

type View = 'home' | 'roster' | 'wizard' | 'sheet' | 'gm'

export default function App() {
  // useApi returns localStorageRepository or restApiRepository depending on VITE_USE_API env var
  const api = useApi()

  const [view, setView] = useState<View>('home')
  const [character, setCharacter] = useState<Character | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const {
    importedCharacter,
    duplicateImport,
    handleImport,
    handleImportDirect,
    handleDuplicateConfirm,
    handleDuplicateDismiss,
    handleImportConfirm,
    handleImportDismiss,
  } = useImportFlow(
    api,
    (c) => {
      setCharacter(c)
      setView('sheet')
    },
    () => setSaveStatus('error')
  )

  // --- Roster ---

  // Called when the user picks a character from the roster.
  async function handleRosterSelect(id: string) {
    try {
      const loaded = await api.getById(id)
      setCharacter(loaded)
      setView('sheet')
    } catch {
      setSaveStatus('error')
    }
  }

  // --- Wizard ---

  // Called when the New Character wizard finishes its final step.
  async function handleWizardComplete(newChar: Character) {
    try {
      const created = await api.create(newChar)
      setCharacter(created)
      setView('sheet')
    } catch {
      setCharacter(newChar)
      setView('sheet')
    }
  }

  // --- Sheet actions ---

  // Called by the Save button on the character sheet.
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
  function handleExport(c: Character) {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${c.name.replace(/\s+/g, '_')}_character.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Routing ---
  // Single return so modals can overlay any view.

  return (
    <>
      {view === 'home' && (
        <HomeScreen
          onNewCharacter={() => setView('wizard')}
          onExistingCharacter={() => setView('roster')}
          onImport={handleImportDirect}
          onGM={() => setView('gm')}
        />
      )}

      {view === 'roster' && (
        <CharacterRoster api={api} onSelect={handleRosterSelect} onBack={() => setView('home')} />
      )}

      {view === 'gm' && <GMDashboard onBack={() => setView('home')} />}

      {view === 'wizard' && (
        <CharacterWizard onComplete={handleWizardComplete} onCancel={() => setView('home')} />
      )}

      {view === 'sheet' && character && (
        <>
          {saveStatus === 'saved' && (
            <div className="fixed top-4 right-4 bg-green-800 text-green-200 px-4 py-2 rounded shadow-lg z-40 text-sm">
              Character saved!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="fixed top-4 right-4 bg-red-800 text-red-200 px-4 py-2 rounded shadow-lg z-40 text-sm">
              Save failed.
            </div>
          )}
          <CharacterSheet
            key={character.id}
            initial={character}
            onSave={handleSave}
            onExport={handleExport}
            onImport={handleImport}
            onNewCharacter={() => setView('home')}
          />
        </>
      )}

      {/* Duplicate detected — ask the user if they want a copy */}
      {duplicateImport && (
        <DuplicateCharacterModal
          character={duplicateImport.parsed}
          onConfirm={handleDuplicateConfirm}
          onDismiss={handleDuplicateDismiss}
        />
      )}

      {/* Successful import — ask whether to switch to the character */}
      {importedCharacter && (
        <ImportConfirmModal
          character={importedCharacter}
          onConfirm={handleImportConfirm}
          onDismiss={handleImportDismiss}
        />
      )}
    </>
  )
}
