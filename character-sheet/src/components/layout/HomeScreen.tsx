import { useRef, useState } from 'react'
import { parseContentPack } from '../../services/contentPackService'
import type { ImportResult } from '../../services/contentPackService'
import { parseOfficialBundle, officialImportResult } from '../../utils/parseOfficialBundle'
import type { OfficialImportResult } from '../../utils/parseOfficialBundle'
import { useHomebrew } from '../../context/HomebrewContext'

interface Props {
  onNewCharacter: () => void
  onExistingCharacter: () => void
  onImport: (file: File) => void
  onGM: () => void
}

type PackStatus = null | { ok: true; result: ImportResult } | { ok: false }
type OfficialStatus = null | { ok: true; result: OfficialImportResult } | { ok: false }

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

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function packStatusMessage(result: ImportResult): { text: string; color: string } {
  if (result.powersCount === 0 && result.perksCount === 0 && result.artifactsCount === 0) {
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
  if (result.artifactsCount > 0)
    parts.push(`${result.artifactsCount} artifact${result.artifactsCount !== 1 ? 's' : ''}`)
  return { text: `Imported ${parts.join(', ')}.`, color: 'text-green-400' }
}

export default function HomeScreen({ onNewCharacter, onExistingCharacter, onImport, onGM }: Props) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const contentPackInputRef = useRef<HTMLInputElement>(null)
  const officialInputRef = useRef<HTMLInputElement>(null)
  const [packStatus, setPackStatus] = useState<PackStatus>(null)
  const [officialStatus, setOfficialStatus] = useState<OfficialStatus>(null)
  const [clearOfficialPending, setClearOfficialPending] = useState(false)
  const [clearHomebrewPending, setClearHomebrewPending] = useState(false)
  const {
    replacePowers,
    replacePerks,
    replaceArtifacts,
    clearAllHomebrew,
    officialPowers,
    officialPerks,
    officialMonsters,
    officialAbilities,
    officialArtifacts,
    importOfficialContent,
    clearOfficialContent,
    powers,
    artifacts,
  } = useHomebrew()

  const hasOfficialContent =
    officialPowers !== null ||
    officialPerks.length > 0 ||
    officialMonsters.length > 0 ||
    officialAbilities.length > 0 ||
    officialArtifacts.length > 0

  const hasHomebrew = powers.length > 0 || artifacts.length > 0

  function handleContentPackFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const { powers: pw, perks, artifacts: art } = parseContentPack(e.target?.result as string)
        // Full replace, not merge: the GM's exported pack is authoritative, so entries the
        // GM deleted must disappear from the player's storage too.
        replacePowers(pw)
        replacePerks(perks)
        replaceArtifacts(art)
        const result: ImportResult = {
          powersCount: pw.length,
          perksCount: perks.length,
          artifactsCount: art.length,
        }
        setPackStatus({ ok: true, result })
      } catch {
        setPackStatus({ ok: false })
      }
    }
    reader.readAsText(file)
  }

  function handleOfficialFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const bundle = parseOfficialBundle(e.target?.result as string)
        importOfficialContent(bundle)
        setOfficialStatus({ ok: true, result: officialImportResult(bundle) })
      } catch {
        setOfficialStatus({ ok: false })
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
          title="Gamemaster"
          description="Monster compendium, encounter management, and homebrew content tools."
          onClick={onGM}
        />

        {/* Import row — two half-width buttons */}
        <div className="flex gap-4">
          <button
            data-testid="import-character-button"
            onClick={() => importInputRef.current?.click()}
            className="flex-1 flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-900 hover:border-amber-600 hover:bg-gray-800 transition-all cursor-pointer"
          >
            <UploadIcon />
            <span className="text-sm font-bold text-gray-100">Import Character</span>
            <span className="text-xs text-gray-400 leading-relaxed">Load from a JSON file</span>
          </button>
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
            <div className="flex-1 flex flex-col gap-2">
              <button
                data-testid="import-content-pack-button"
                onClick={() => contentPackInputRef.current?.click()}
                className="flex-1 flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-900 hover:border-amber-600 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <UploadIcon />
                <span className="text-sm font-bold text-gray-100">Import Content Pack</span>
                <span className="text-xs text-gray-400 leading-relaxed">Homebrew from your GM</span>
              </button>
              {hasHomebrew && (
                <button
                  onClick={() => {
                    if (clearHomebrewPending) {
                      clearAllHomebrew()
                      setClearHomebrewPending(false)
                    } else {
                      setClearHomebrewPending(true)
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors text-center"
                >
                  {clearHomebrewPending ? 'Click again to confirm' : 'Clear all homebrew'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-900">
              <UploadIcon />
              <span className="text-sm font-bold text-gray-100">Import Content Pack</span>
              {!packStatus.ok ? (
                <span className="text-xs text-red-400">Invalid file.</span>
              ) : (
                <span
                  className={`text-xs leading-relaxed ${packStatusMessage(packStatus.result).color}`}
                >
                  {packStatusMessage(packStatus.result).text}
                </span>
              )}
              <button
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
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
                e.target.value = ''
              }
            }}
          />
        </div>

        {/* Import Official Content */}
        <div className="flex gap-4">
          {officialStatus === null ? (
            <div className="flex-1 flex flex-col gap-2">
              <button
                data-testid="import-official-button"
                onClick={() => officialInputRef.current?.click()}
                className="flex-1 flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-900 hover:border-amber-600 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <UploadIcon />
                <span className="text-sm font-bold text-gray-100">Import Official Content</span>
                <span className="text-xs text-gray-400 leading-relaxed">
                  {hasOfficialContent ? 'Loaded' : 'Restore official names and text'}
                </span>
              </button>
              {hasOfficialContent && (
                <button
                  onClick={() => {
                    if (clearOfficialPending) {
                      clearOfficialContent()
                      setClearOfficialPending(false)
                    } else {
                      setClearOfficialPending(true)
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors text-center"
                >
                  {clearOfficialPending ? 'Click again to confirm' : 'Clear official content'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center text-center gap-2 p-4 rounded-xl border border-gray-700 bg-gray-900">
              <UploadIcon />
              <span className="text-sm font-bold text-gray-100">Import Official Content</span>
              {!officialStatus.ok ? (
                <span className="text-xs text-red-400">Invalid file.</span>
              ) : (
                <span className="text-xs text-green-400 leading-relaxed">
                  {`Loaded ${officialStatus.result.powersClassCount} class(es), ${officialStatus.result.perksCount} perk(s), ${officialStatus.result.monstersCount} monster(s).`}
                </span>
              )}
              <button
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                onClick={() => setOfficialStatus(null)}
              >
                Import another
              </button>
            </div>
          )}
          <input
            data-testid="official-content-input"
            ref={officialInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleOfficialFile(file)
                e.target.value = ''
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
