import { useState } from 'react'
import type { Campaign } from '../../types/campaign'

interface Props {
  campaign: Campaign
  onUpdate: (updated: Campaign) => void
}

export default function RuinWidget({ campaign, onUpdate }: Props) {
  const [spending, setSpending] = useState(false)
  const [spendAmount, setSpendAmount] = useState(1)

  function addRuin(amount: number) {
    onUpdate({ ...campaign, ruin: campaign.ruin + amount })
  }

  function confirmSpend() {
    onUpdate({ ...campaign, ruin: Math.max(0, campaign.ruin - spendAmount) })
    setSpending(false)
    setSpendAmount(1)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Ruin</p>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-3xl font-bold text-red-400 min-w-[2ch] text-center">
          {campaign.ruin}
        </span>

        <div className="flex gap-1.5">
          <button
            onClick={() => addRuin(1)}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            +1
          </button>
          <button
            onClick={() => addRuin(3)}
            title="Respite (+3)"
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            +3
          </button>
          <button
            onClick={() => addRuin(7)}
            title="Full Rest (+7)"
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          >
            +7
          </button>
        </div>

        {spending ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={spendAmount}
              min={1}
              onChange={(e) => setSpendAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-xs text-center text-gray-200 focus:outline-none focus:border-red-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={confirmSpend}
              className="text-xs px-2 py-1 rounded bg-red-800 hover:bg-red-700 text-white transition-colors"
            >
              Spend
            </button>
            <button
              onClick={() => setSpending(false)}
              className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSpending(true)}
            className="text-xs px-2 py-1 rounded border border-red-900 text-red-400 hover:border-red-700 hover:text-red-300 transition-colors"
          >
            Spend
          </button>
        )}
      </div>

      <div className="flex gap-3 mt-1.5">
        <span className="text-xs text-gray-600">+3 = Respite · +7 = Full Rest</span>
      </div>
    </div>
  )
}
