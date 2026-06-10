import { useState } from 'react'
import type { SavedEncounter } from '../../../types/encounter'
import { getEncounters, upsertEncounter, deleteEncounter } from '../../../services/encounterStorage'
import { isQuotaError } from '../../../utils/storageErrors'
import StorageErrorToast from '../../ui/StorageErrorToast'
import EncounterList from './EncounterList'
import EncounterForm from './EncounterForm'
import EncounterTracker from './EncounterTracker'

type BuilderView = 'list' | 'form' | 'tracker'

interface Props {
  onBack: () => void
  campaignId?: string
}

export default function EncounterBuilder({ onBack, campaignId }: Props) {
  const [view, setView] = useState<BuilderView>('list')
  const [encounters, setEncounters] = useState<SavedEncounter[]>(() => getEncounters())
  const [editingEncounter, setEditingEncounter] = useState<SavedEncounter | undefined>()
  const [activeEncounter, setActiveEncounter] = useState<SavedEncounter | undefined>()
  const [storageError, setStorageError] = useState(false)

  function handleSave(enc: SavedEncounter) {
    try {
      upsertEncounter(enc)
      setEncounters(getEncounters())
      setEditingEncounter(undefined)
      setView('list')
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  // Saves before launching so the encounter persists even if the user never hit Save explicitly.
  function handleRunNow(enc: SavedEncounter) {
    try {
      upsertEncounter(enc)
      setEncounters(getEncounters())
      setEditingEncounter(undefined)
      setActiveEncounter(enc)
      setView('tracker')
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  function handleRun(enc: SavedEncounter) {
    setActiveEncounter(enc)
    setView('tracker')
  }

  function handleDelete(id: string) {
    deleteEncounter(id)
    setEncounters(getEncounters())
  }

  if (view === 'form') {
    return (
      <>
        {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
        <EncounterForm
          initial={editingEncounter}
          onSave={handleSave}
          onRunNow={handleRunNow}
          onCancel={() => {
            setEditingEncounter(undefined)
            setView('list')
          }}
        />
      </>
    )
  }

  if (view === 'tracker' && activeEncounter) {
    return (
      <EncounterTracker
        encounter={activeEncounter}
        campaignId={campaignId}
        onEnd={() => {
          setActiveEncounter(undefined)
          setView('list')
        }}
      />
    )
  }

  return (
    <>
      {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
      <EncounterList
        encounters={encounters}
        onBack={onBack}
        onCreate={() => {
          setEditingEncounter(undefined)
          setView('form')
        }}
        onEdit={(enc) => {
          setEditingEncounter(enc)
          setView('form')
        }}
        onRun={handleRun}
        onDelete={handleDelete}
      />
    </>
  )
}
