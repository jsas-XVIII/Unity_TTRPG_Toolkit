import type { DLRange, RangeKey } from './dlRanges'

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500'
const inputWarnCls =
  'w-full bg-gray-800 border border-amber-500 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-400'
const labelCls = 'block text-xs text-gray-400 mb-1'
const labelWarnCls = 'block text-xs text-amber-400 mb-1'

export interface StatField {
  label: string
  value: string
  onChange: (v: string) => void
  rangeKey: RangeKey
}

interface Props {
  statFields: StatField[]
  outOfRange: Set<RangeKey>
  dlRange: DLRange | null
}

export default function MonsterStatsSection({ statFields, outOfRange, dlRange }: Props) {
  return (
    <section className="bg-gray-900 rounded-lg p-4 space-y-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</h2>

      <div className="grid grid-cols-3 gap-3">
        {statFields.map(({ label, value, onChange, rangeKey }) => {
          const isOut = outOfRange.has(rangeKey)
          return (
            <div key={label}>
              <label className={isOut ? labelWarnCls : labelCls}>
                {label}
                {isOut ? ' ⚠' : ''}
              </label>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={isOut ? inputWarnCls : inputCls}
              />
              {isOut && dlRange && (
                <p className="text-xs text-amber-500 mt-0.5">
                  {dlRange[rangeKey][0]}–{dlRange[rangeKey][1]}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
