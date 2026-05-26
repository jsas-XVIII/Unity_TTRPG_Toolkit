import { useState } from 'react'
import Modal from '../ui/Modal'
import type { Character } from '../../types/character'
import type { RollResult } from '../../types/dice'
import type { DerivedStats } from '../../utils/derivedStats'
import { getHistory, pushResult, clearHistory } from '../../services/rollHistoryStorage'
import RollTab from './RollTab'
import HistoryTab from './HistoryTab'

interface Props {
  character: Character
  derived: DerivedStats
  onClose: () => void
}

type Tab = 'roll' | 'history'

// Dice-rolling modal with a Roll tab and a per-character roll-history tab.
// [JSas | 2026-05-25] Modified: replaced inline overlay markup with shared Modal component
export default function DiceTrayModal({ character, derived, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('roll')
  const [history, setHistory] = useState<RollResult[]>(() => getHistory(character.id))

  function handleRoll(result: RollResult) {
    setHistory(pushResult(character.id, result))
  }

  function handleClear() {
    clearHistory(character.id)
    setHistory([])
  }

  const TAB_CLASS = (tab: Tab) =>
    `px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-amber-500 text-amber-400'
        : 'border-transparent text-gray-500 hover:text-gray-300'
    }`

  return (
    <Modal onClose={onClose} className="border border-gray-700 max-w-md flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-gray-100">Dice Tray</h2>
        <button
          className="text-gray-500 hover:text-gray-300 text-xl leading-none"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-800 px-4">
        <button className={TAB_CLASS('roll')} onClick={() => setActiveTab('roll')}>
          Roll
        </button>
        <button className={TAB_CLASS('history')} onClick={() => setActiveTab('history')}>
          History
          {history.length > 0 && (
            <span className="ml-1.5 text-xs bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'roll' ? (
          <RollTab
            characterId={character.id}
            attributes={character.attributes}
            derived={derived}
            onRoll={handleRoll}
          />
        ) : (
          <HistoryTab history={history} onClear={handleClear} />
        )}
      </div>
    </Modal>
  )
}
