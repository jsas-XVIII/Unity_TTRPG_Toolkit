import { useState } from 'react'
import MonsterRoster from './monsters/MonsterRoster'
import PowersPanel from './powers/PowersPanel'
import PerksPanel from './perks/PerksPanel'
import { exportContentPack } from '../../services/contentPackService'

type GMView = 'dashboard' | 'monsters' | 'powers' | 'perks'

interface Props {
  onBack: () => void
}

interface ToolCardProps {
  title: string
  description: string
  onClick?: () => void
  disabled?: boolean
  badge?: string
}

function ToolCard({ title, description, onClick, disabled, badge }: ToolCardProps) {
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

export default function GMDashboard({ onBack }: Props) {
  const [gmView, setGMView] = useState<GMView>('dashboard')

  if (gmView === 'monsters') return <MonsterRoster onBack={() => setGMView('dashboard')} />
  if (gmView === 'powers') return <PowersPanel onBack={() => setGMView('dashboard')} />
  if (gmView === 'perks') return <PerksPanel onBack={() => setGMView('dashboard')} />

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-sm mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">GM Tools</h1>
          <p className="mt-2 text-gray-500 text-sm">Encounter management and homebrew content</p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <ToolCard
            title="Monster Compendium"
            description="Browse, filter, and manage monster stat blocks for your encounters."
            onClick={() => setGMView('monsters')}
          />
          <ToolCard
            title="Powers Editor"
            description="Browse, edit, and add homebrew powers for any class."
            onClick={() => setGMView('powers')}
          />
          <ToolCard
            title="Perks Editor"
            description="Edit general perks and add homebrew perks for your campaign."
            onClick={() => setGMView('perks')}
          />
          <ToolCard
            title="Export Content Pack"
            description="Download all homebrew powers and perks as unity-content-pack.json to share with players."
            onClick={exportContentPack}
          />
          <ToolCard
            title="Ruin Tracker"
            description="Track accumulated Ruin points to spend on monster abilities."
            disabled
            badge="Coming Soon"
          />
          <ToolCard
            title="Encounter Builder"
            description="Build and balance encounters by party level and danger level."
            disabled
            badge="Coming Soon"
          />
        </div>
      </div>
    </div>
  )
}
