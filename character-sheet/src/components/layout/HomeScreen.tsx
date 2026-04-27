import { useRef, useState } from 'react'
import { importContentPack } from '../../services/contentPackService'
import type { ImportResult } from '../../services/contentPackService'

interface Props {
  onNewCharacter: () => void
  onExistingCharacter: () => void
  onImport: (file: File) => void
  onGM: () => void
}

type PackStatus = null | { ok: true; result: ImportResult } | { ok: false }

interface OptionCardProps {
  title: string
  description: string
  onClick?: () => void
  disabled?: boolean
  badge?: string
}

function OptionCard({ title, description, onClick, disabled, badge }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-start text-left w-full p-6 rounded-xl border transition-all
        ${
          disabled
            ? 'border-gray-800 bg-gray-900 opacity-50 cursor-not-allowed'
            : 'border-gray-700 bg-gray-900 hover:border-amber-600 hover:bg-gray-800 cursor-pointer'
        }
      `}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
          {badge}
        </span>
      )}
      <span className="text-lg font-bold text-gray-100 mb-2">{title}</span>
      <span className="text-sm text-gray-400 leading-relaxed">{description}</span>
    </button>
  )
}

function packStatusMessage(result: ImportResult): { text: string; color: string } {
  if (result.powersCount === 0 && result.perksCount === 0) {
    return {
      text: 'Import successful — no content found. Check with your GM.',
      color: 'text-yellow-400',
    }
  }
  const parts: string[] = []
  if (result.powersCount > 0)
    parts.push(`${result.powersCount} power${result.powersCount !== 1 ? 's' : ''}`)
  if (result.perksCount > 0)
    parts.push(`${result.perksCount} perk${result.perksCount !== 1 ? 's' : ''}`)
  return { text: `Imported ${parts.join(' and ')}.`, color: 'text-green-400' }
}

export default function HomeScreen({ onNewCharacter, onExistingCharacter, onImport, onGM }: Props) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const contentPackInputRef = useRef<HTMLInputElement>(null)
  const [packStatus, setPackStatus] = useState<PackStatus>(null)

  function handleContentPackFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = importContentPack(e.target?.result as string)
        setPackStatus({ ok: true, result })
      } catch {
        setPackStatus({ ok: false })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* App title */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-100 tracking-tight">Unity TTRPG Toolkit</h1>
        <p className="mt-2 text-gray-500 text-sm">Character sheets and GM tools for Unity RPG</p>
      </div>

      {/* Option cards */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        <OptionCard
          title="New Character"
          description="Walk through the step-by-step character creation wizard to build a new character from scratch."
          onClick={onNewCharacter}
        />
        <OptionCard
          title="Existing Character"
          description="Load a character you've already created and saved in this browser."
          onClick={onExistingCharacter}
        />
        <OptionCard
          title="Import Character"
          description="Load a character from a JSON file exported from this app."
          onClick={() => importInputRef.current?.click()}
        />
        <input
          data-testid="character-import-input"
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              onImport(file)
              e.target.value = ''
            }
          }}
        />

        {packStatus === null ? (
          <OptionCard
            title="Import Content Pack"
            description="Load homebrew powers and perks shared by your GM."
            onClick={() => contentPackInputRef.current?.click()}
          />
        ) : (
          <div className="relative flex flex-col items-start text-left w-full p-6 rounded-xl border border-gray-700 bg-gray-900">
            <span className="text-lg font-bold text-gray-100 mb-2">Import Content Pack</span>
            {!packStatus.ok ? (
              <span className="text-sm text-red-400">Invalid content pack file.</span>
            ) : (
              <span className={`text-sm ${packStatusMessage(packStatus.result).color}`}>
                {packStatusMessage(packStatus.result).text}
              </span>
            )}
            <button
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              onClick={() => setPackStatus(null)}
            >
              Import another
            </button>
          </div>
        )}
        <input
          data-testid="content-pack-input"
          ref={contentPackInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleContentPackFile(file)
              // Reset so the same file can be re-imported after "Import another"
              e.target.value = ''
            }
          }}
        />

        <OptionCard
          title="Gamemaster"
          description="Monster compendium, encounter management, and homebrew content tools."
          onClick={onGM}
        />
      </div>
    </div>
  )
}
