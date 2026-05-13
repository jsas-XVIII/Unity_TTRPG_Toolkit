import { useState, useMemo } from 'react'
import StorageErrorToast from '../../ui/StorageErrorToast'
import { isQuotaError } from '../../../utils/storageErrors'
import type { ArtifactDefinition } from '../../../types/artifact'
import {
  getAllArtifacts,
  getOfficialArtifacts,
  isOfficialArtifact,
} from '../../../data/artifactsData'
import { useHomebrew } from '../../../context/HomebrewContext'
import ArtifactEditorForm from './ArtifactEditorForm'
import { uid } from '../../../utils/idGenerator'

interface Props {
  onBack: () => void
}

export default function ArtifactsPanel({ onBack }: Props) {
  const [editing, setEditing] = useState<{
    artifact: ArtifactDefinition
    readOnly: boolean
  } | null>(null)
  const [storageError, setStorageError] = useState(false)
  const { artifacts: homebrewArtifacts, upsertArtifact, deleteArtifact } = useHomebrew()

  const homebrewIds = useMemo(
    () => new Set(homebrewArtifacts.map((a) => a.id)),
    [homebrewArtifacts]
  )
  const artifacts = useMemo(() => {
    void homebrewArtifacts
    return getAllArtifacts()
  }, [homebrewArtifacts])

  function startView(artifact: ArtifactDefinition) {
    setEditing({ artifact, readOnly: true })
  }

  function startEdit(artifact: ArtifactDefinition) {
    setEditing({ artifact, readOnly: false })
  }

  function startNew() {
    setEditing({
      artifact: {
        id: `hb-art-${uid()}`,
        name: '',
        category: 'Accessory',
        subtype: '',
        description: '',
        effects: [],
      },
      readOnly: false,
    })
  }

  function handleSave(artifact: ArtifactDefinition) {
    try {
      upsertArtifact(artifact)
      setEditing(null)
    } catch (e) {
      if (isQuotaError(e)) setStorageError(true)
    }
  }

  function handleReset(id: string) {
    deleteArtifact(id)
    setEditing(null)
  }

  function handleDelete(id: string) {
    deleteArtifact(id)
    setEditing(null)
  }

  if (editing) {
    const { artifact, readOnly } = editing
    const official = isOfficialArtifact(artifact.id)
    const overridden = official && homebrewIds.has(artifact.id)
    return (
      <>
        {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
        <ArtifactEditorForm
          initial={artifact}
          isOfficial={official}
          isOverridden={overridden}
          readOnly={readOnly}
          onSave={handleSave}
          onReset={overridden ? () => handleReset(artifact.id) : undefined}
          onDelete={!official ? () => handleDelete(artifact.id) : undefined}
          onCancel={() => setEditing(null)}
        />
      </>
    )
  }

  return (
    <>
      {storageError && <StorageErrorToast onDismiss={() => setStorageError(false)} />}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-100">Artifacts Editor</h1>
          <span className="text-xs text-gray-500">{artifacts.length} artifacts</span>
          <div className="ml-auto">
            <button
              onClick={startNew}
              className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
            >
              + New Artifact
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {artifacts.map((artifact) => {
            const official = isOfficialArtifact(artifact.id)
            const overridden = official && homebrewIds.has(artifact.id)
            const homebrewOnly = !official

            return (
              <div
                key={artifact.id}
                className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-100">{artifact.name}</span>
                    <span className="text-xs text-gray-500">{artifact.category}</span>
                    {overridden && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-900 text-amber-300">
                        Overridden
                      </span>
                    )}
                    {homebrewOnly && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                        Homebrew
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-snug line-clamp-1">
                    {artifact.subtype ? `${artifact.subtype} · ` : ''}
                    {artifact.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startView(artifact)}
                    className="text-xs px-3 py-1.5 rounded border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startEdit(artifact)}
                    className="text-xs px-3 py-1.5 rounded border border-amber-800 text-amber-400 hover:border-amber-600 hover:text-amber-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-xs text-gray-600">
          {getOfficialArtifacts().length} official · {homebrewIds.size} homebrew
        </p>
      </div>
    </>
  )
}
