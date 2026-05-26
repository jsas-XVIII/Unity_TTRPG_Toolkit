import type { DLRange, RangeKey } from './dlRanges'
import { FORM_INPUT, FORM_INPUT_WARN, FORM_LABEL, FORM_LABEL_WARN } from '../../../styles/classes'

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

// Stat fields grid for the monster form; applies amber warning styles when a value is outside its DL range.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL shared constants
export default function MonsterStatsSection({ statFields, outOfRange, dlRange }: Props) {
  return (
    <section className="bg-gray-900 rounded-lg p-4 space-y-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</h2>

      <div className="grid grid-cols-3 gap-3">
        {statFields.map(({ label, value, onChange, rangeKey }) => {
          const isOut = outOfRange.has(rangeKey)
          return (
            <div key={label}>
              <label className={isOut ? FORM_LABEL_WARN : FORM_LABEL}>
                {label}
                {isOut ? ' ⚠' : ''}
              </label>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={isOut ? FORM_INPUT_WARN : FORM_INPUT}
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
