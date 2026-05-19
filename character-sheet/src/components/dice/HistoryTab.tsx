import type { RollResult } from '../../types/dice'

interface Props {
  history: RollResult[]
  onClear: () => void
}

function formatBonuses(result: RollResult): string {
  const parts: string[] = []
  if (result.attributeBonus !== 0)
    parts.push(`attr ${result.attributeBonus > 0 ? '+' : ''}${result.attributeBonus}`)
  if (result.halfLevelBonus !== 0) parts.push(`HL +${result.halfLevelBonus}`)
  if (result.miscBonus !== 0)
    parts.push(`misc ${result.miscBonus > 0 ? '+' : ''}${result.miscBonus}`)
  return parts.length ? `(${parts.join(', ')})` : ''
}

function DiceChips({ result }: { result: RollResult }) {
  const keptSet = new Set(result.keptDice.map((_, i) => i))

  if (result.dice === '2d10' && result.allDice.length === 3) {
    // benefit or hindrance — show all 3, dim the dropped one
    const keptValues = new Set(result.keptDice)
    const remainingKept = [...result.keptDice]
    return (
      <span className="flex gap-1 flex-wrap">
        {result.allDice.map((v, i) => {
          // Match kept dice by value, consuming each match once
          const idx = remainingKept.indexOf(v)
          const isKept = idx !== -1
          if (isKept) remainingKept.splice(idx, 1)
          void keptSet
          void keptValues
          return (
            <span
              key={i}
              className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold ${
                isKept ? 'bg-gray-700 text-gray-100' : 'bg-gray-800 text-gray-500 line-through'
              }`}
            >
              {v}
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <span className="flex gap-1 flex-wrap">
      {result.allDice.map((v, i) => (
        <span
          key={i}
          className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold bg-gray-700 text-gray-100"
        >
          {v}
        </span>
      ))}
    </span>
  )
}

export default function HistoryTab({ history, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-sm">
        No rolls yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">
          Last {history.length} roll{history.length !== 1 ? 's' : ''}
        </p>
        <button
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          onClick={onClear}
        >
          Clear history
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {history.map((entry, i) => (
          <div key={i} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-200 truncate">
                  {entry.label || entry.dice}
                </span>
                {entry.dice === '2d10' && entry.benHin !== 'normal' && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      entry.benHin === 'benefit'
                        ? 'bg-green-900/60 text-green-300'
                        : 'bg-red-900/60 text-red-300'
                    }`}
                  >
                    {entry.benHin}
                  </span>
                )}
                {entry.isCrit && (
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-amber-700 text-amber-100">
                    CRIT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <DiceChips result={entry} />
                <span className="text-xs text-gray-500">{formatBonuses(entry)}</span>
              </div>
            </div>
            <div className="text-xl font-bold text-amber-400 tabular-nums shrink-0">
              {entry.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
