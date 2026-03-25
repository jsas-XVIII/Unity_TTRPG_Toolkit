import { useState } from 'react'
import CharacterSheet from './components/layout/CharacterSheet'
import CharacterWizard from './components/wizard/CharacterWizard'
import type { Character } from './types/character'
import { useApi } from './hooks/useApi'

type View = 'wizard' | 'sheet'

export default function App() {
  const api = useApi()
  const [view, setView] = useState<View>('wizard')
  const [character, setCharacter] = useState<Character | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

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

  function handleExport(c: Character) {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${c.name.replace(/\s+/g, '_')}_character.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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
      {saveStatus === 'saved' && (
        <div className="fixed top-4 right-4 bg-green-800 text-green-200 px-4 py-2 rounded shadow-lg z-50 text-sm">
          Character saved!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="fixed top-4 right-4 bg-red-800 text-red-200 px-4 py-2 rounded shadow-lg z-50 text-sm">
          Save failed.
        </div>
      )}
      <CharacterSheet
        initial={character}
        onSave={handleSave}
        onExport={handleExport}
        onNewCharacter={handleNewCharacter}
      />
    </>
  )
}
