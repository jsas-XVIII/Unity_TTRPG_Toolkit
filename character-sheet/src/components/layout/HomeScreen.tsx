// HomeScreen.tsx — the initial landing screen shown when the app loads.
// Presents four paths: create a new character, load an existing one,
// import a character from a JSON file, or enter GM mode.
// GM tools are not yet built so that option is marked as coming soon.

import { useRef } from 'react'

interface Props {
  onNewCharacter: () => void
  onExistingCharacter: () => void
  onImport: (file: File) => void
}

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

export default function HomeScreen({ onNewCharacter, onExistingCharacter, onImport }: Props) {
  // Ref for the hidden file input — triggered programmatically by the Import Character card
  const importInputRef = useRef<HTMLInputElement>(null)

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
        {/* Hidden file input — clicked programmatically by the Import Character card */}
        <input
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
        <OptionCard
          title="Gamemaster"
          description="Ruin tracker, Spark Points, encounter management, and homebrew content tools."
          disabled
          badge="Coming Soon"
        />
      </div>
    </div>
  )
}
