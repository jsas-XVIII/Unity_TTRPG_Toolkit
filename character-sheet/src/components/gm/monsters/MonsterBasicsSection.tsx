import type { Monster } from '../../../types/monster'
import type { DLRange } from './dlRanges'
import { FORM_INPUT, FORM_INPUT_WARN, FORM_LABEL, FORM_LABEL_WARN } from '../../../styles/classes'

interface Props {
  name: string
  onNameChange: (v: string) => void
  dangerLevel: string
  onDangerLevelChange: (v: string) => void
  type: 'Standard' | 'Elite'
  onTypeChange: (v: 'Standard' | 'Elite') => void
  size: Monster['size']
  onSizeChange: (v: Monster['size']) => void
  faction: string
  onFactionChange: (v: string) => void
  xp: string
  onXpChange: (v: string) => void
  xpOutOfRange: boolean
  dlRange: DLRange | null
  onApplyBaseline: () => void
}

// Identity/basics fields (name, DL, type, size, faction, XP) for the monster creation form.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL shared constants
export default function MonsterBasicsSection({
  name,
  onNameChange,
  dangerLevel,
  onDangerLevelChange,
  type,
  onTypeChange,
  size,
  onSizeChange,
  faction,
  onFactionChange,
  xp,
  onXpChange,
  xpOutOfRange,
  dlRange,
  onApplyBaseline,
}: Props) {
  return (
    <section className="bg-gray-900 rounded-lg p-4 space-y-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identity</h2>

      <div>
        <label className={FORM_LABEL}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={FORM_INPUT}
          placeholder="Monster name"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-400">Danger Level</label>
            <button
              type="button"
              onClick={onApplyBaseline}
              className="text-xs px-2 py-0.5 rounded border border-amber-700 text-amber-400 hover:bg-amber-700 hover:text-white transition-colors"
              title="Fill stats with minimum values for this DL"
            >
              Apply baseline
            </button>
          </div>
          <input
            type="number"
            min="1"
            max="12"
            value={dangerLevel}
            onChange={(e) => onDangerLevelChange(e.target.value)}
            className={FORM_INPUT}
          />
        </div>
        <div>
          <label className={FORM_LABEL}>Type</label>
          <div className="flex rounded overflow-hidden border border-gray-700 h-[34px]">
            {(['Standard', 'Elite'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={`flex-1 text-xs transition-colors ${
                  type === t
                    ? 'bg-amber-700 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={FORM_LABEL}>Size</label>
          <select
            value={size}
            onChange={(e) => onSizeChange(e.target.value as Monster['size'])}
            className={FORM_INPUT}
          >
            {(['Small', 'Medium', 'Large', 'Massive', 'Colossal'] as const).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={FORM_LABEL}>Faction</label>
          <input
            type="text"
            value={faction}
            onChange={(e) => onFactionChange(e.target.value)}
            className={FORM_INPUT}
            placeholder="e.g. Crimson Horde"
          />
        </div>
        <div>
          <label className={xpOutOfRange ? FORM_LABEL_WARN : FORM_LABEL}>
            XP Reward{xpOutOfRange ? ' ⚠' : ''}
          </label>
          <input
            type="number"
            min="0"
            value={xp}
            onChange={(e) => onXpChange(e.target.value)}
            className={xpOutOfRange ? FORM_INPUT_WARN : FORM_INPUT}
          />
          {xpOutOfRange && dlRange && (
            <p className="text-xs text-amber-500 mt-0.5">
              Suggested: {dlRange.xp[0]}–{dlRange.xp[1]}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
