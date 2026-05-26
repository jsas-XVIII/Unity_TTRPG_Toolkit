import type { MonsterAbility, MonsterAbilityKind } from '../../../types/monster'
import { FORM_INPUT, FORM_LABEL } from '../../../styles/classes'

export interface AbilityDraft {
  name: string
  description: string
  ruinCost: string
  recharge: string
}

interface Props {
  kind: MonsterAbilityKind
  library: MonsterAbility[]
  selected: string[]
  draft: AbilityDraft | null
  onToggle: (id: string) => void
  onStartNew: () => void
  onCancelNew: () => void
  onCommitNew: (draft: AbilityDraft) => void
  onDraftChange: (draft: AbilityDraft) => void
}

// Library picker + inline draft form for a single monster trait or power.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL
export default function MonsterAbilitySection({
  kind,
  library,
  selected,
  draft,
  onToggle,
  onStartNew,
  onCancelNew,
  onCommitNew,
  onDraftChange,
}: Props) {
  const heading = kind === 'trait' ? 'Traits' : 'Powers'
  const canCommit = !!draft && draft.name.trim().length > 0 && draft.description.trim().length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{heading}</h3>
        {!draft && (
          <button
            type="button"
            onClick={onStartNew}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            + New {kind === 'trait' ? 'Trait' : 'Power'}
          </button>
        )}
      </div>

      {library.length === 0 && !draft && (
        <p className="text-xs text-gray-600 italic mb-3">
          No {heading.toLowerCase()} in the library yet.
        </p>
      )}

      <div className="space-y-2 mb-3">
        {library.map((a) => (
          <label key={a.id} className="flex items-start gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(a.id)}
              onChange={() => onToggle(a.id)}
              className="mt-0.5 accent-amber-500 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
                  {a.name}
                </span>
                {kind === 'power' && (a.ruinCost != null || a.recharge != null) && (
                  <span className="text-xs text-gray-500">
                    {a.ruinCost != null ? `${a.ruinCost} Ruin` : ''}
                    {a.ruinCost != null && a.recharge != null ? ' · ' : ''}
                    {a.recharge != null ? `${a.recharge}rd` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">
                {a.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      {draft && (
        <div className="border border-gray-700 rounded-lg p-3 bg-gray-950 space-y-2">
          <p className="text-xs font-semibold text-amber-400">
            New {kind === 'trait' ? 'Trait' : 'Power'}
          </p>
          <div>
            <label className={FORM_LABEL}>Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
              className={FORM_INPUT}
              placeholder={kind === 'trait' ? 'e.g. Regeneration' : 'e.g. Fireball'}
            />
          </div>
          {kind === 'power' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={FORM_LABEL}>Ruin Cost</label>
                <input
                  type="number"
                  min="0"
                  value={draft.ruinCost}
                  onChange={(e) => onDraftChange({ ...draft, ruinCost: e.target.value })}
                  className={FORM_INPUT}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className={FORM_LABEL}>Recharge (rds)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.recharge}
                  onChange={(e) => onDraftChange({ ...draft, recharge: e.target.value })}
                  className={FORM_INPUT}
                  placeholder="—"
                />
              </div>
            </div>
          )}
          <div>
            <label className={FORM_LABEL}>Description</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
              className={`${FORM_INPUT} resize-none`}
              placeholder="What does this ability do?"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancelNew}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => canCommit && onCommitNew(draft)}
              disabled={!canCommit}
              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                canCommit
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add {kind === 'trait' ? 'Trait' : 'Power'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
