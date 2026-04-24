import { useState } from 'react'
import type { Monster, MonsterAbility, MonsterAbilityKind } from '../../../types/monster'
import { getAllAbilities } from '../../../data/monstersData'
import { addHomebrewAbility } from '../../../services/monsterStorage'

interface Props {
  initial?: Monster
  onSave: (monster: Monster) => void
  onCancel: () => void
  onDelete?: () => void
}

interface AbilityDraft {
  name: string
  description: string
  ruinCost: string
  recharge: string
}

const emptyDraft: AbilityDraft = { name: '', description: '', ruinCost: '', recharge: '' }

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500'
const labelCls = 'block text-xs text-gray-400 mb-1'

interface AbilitySectionProps {
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

function AbilitySection({
  kind,
  library,
  selected,
  draft,
  onToggle,
  onStartNew,
  onCancelNew,
  onCommitNew,
  onDraftChange,
}: AbilitySectionProps) {
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
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
              className={inputCls}
              placeholder={kind === 'trait' ? 'e.g. Regeneration' : 'e.g. Fireball'}
            />
          </div>
          {kind === 'power' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={labelCls}>Ruin Cost</label>
                <input
                  type="number"
                  min="0"
                  value={draft.ruinCost}
                  onChange={(e) => onDraftChange({ ...draft, ruinCost: e.target.value })}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Recharge (rds)</label>
                <input
                  type="number"
                  min="0"
                  value={draft.recharge}
                  onChange={(e) => onDraftChange({ ...draft, recharge: e.target.value })}
                  className={inputCls}
                  placeholder="—"
                />
              </div>
            </div>
          )}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => onDraftChange({ ...draft, description: e.target.value })}
              className={`${inputCls} resize-none`}
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

export default function MonsterForm({ initial, onSave, onCancel, onDelete }: Props) {
  const isEditing = !!initial

  const [name, setName] = useState(initial?.name ?? '')
  const [dangerLevel, setDangerLevel] = useState(String(initial?.dangerLevel ?? 1))
  const [type, setType] = useState<'Standard' | 'Elite'>(initial?.type ?? 'Standard')
  const [size, setSize] = useState<Monster['size']>(initial?.size ?? 'Medium')
  const [faction, setFaction] = useState(initial?.faction ?? '')
  const [xp, setXp] = useState(String(initial?.xp ?? 0))
  const [hp, setHp] = useState(String(initial?.hp ?? 0))
  const [ar, setAr] = useState(String(initial?.ar ?? 0))
  const [dr, setDr] = useState(String(initial?.dr ?? 0))
  const [mr, setMr] = useState(String(initial?.mr ?? 0))
  const [av, setAv] = useState(String(initial?.av ?? 0))
  const [spd, setSpd] = useState(String(initial?.spd ?? 0))
  const [dmg, setDmg] = useState(String(initial?.dmg ?? 0))
  const [damageDie, setDamageDie] = useState(initial?.damageDie ?? '1d6')
  const [traitIds, setTraitIds] = useState<string[]>(initial?.traitIds ?? [])
  const [powerIds, setPowerIds] = useState<string[]>(initial?.powerIds ?? [])
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const [allAbilities, setAllAbilities] = useState(() => getAllAbilities())
  const [traitDraft, setTraitDraft] = useState<AbilityDraft | null>(null)
  const [powerDraft, setPowerDraft] = useState<AbilityDraft | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const libraryTraits = allAbilities.filter((a) => a.kind === 'trait')
  const libraryPowers = allAbilities.filter((a) => a.kind === 'power')

  function toggleAbility(id: string, kind: MonsterAbilityKind) {
    if (kind === 'trait') {
      setTraitIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    } else {
      setPowerIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }
  }

  function commitNewAbility(kind: MonsterAbilityKind, draft: AbilityDraft) {
    const ability: MonsterAbility = {
      id: `hba-${uid()}`,
      name: draft.name.trim(),
      kind,
      description: draft.description.trim(),
      ruinCost: kind === 'power' && draft.ruinCost ? Number(draft.ruinCost) : null,
      recharge: kind === 'power' && draft.recharge ? Number(draft.recharge) : null,
    }
    addHomebrewAbility(ability)
    setAllAbilities(getAllAbilities())
    if (kind === 'trait') {
      setTraitIds((prev) => [...prev, ability.id])
      setTraitDraft(null)
    } else {
      setPowerIds((prev) => [...prev, ability.id])
      setPowerDraft(null)
    }
  }

  function handleSubmit() {
    if (!name.trim()) return
    const monster: Monster = {
      id: initial?.id ?? `hb-${uid()}`,
      name: name.trim(),
      dangerLevel: Number(dangerLevel) || 1,
      type,
      size,
      faction: faction.trim() || null,
      xp: Number(xp) || 0,
      hp: Number(hp) || 0,
      ar: Number(ar) || 0,
      dr: Number(dr) || 0,
      mr: Number(mr) || 0,
      av: Number(av) || 0,
      spd: Number(spd) || 0,
      dmg: Number(dmg) || 0,
      damageDie: damageDie.trim() || '1d6',
      traitIds,
      powerIds,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    onSave(monster)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          ← Cancel
        </button>
        <h1 className="text-xl font-bold text-gray-100">
          {isEditing ? 'Edit Monster' : 'Create Monster'}
        </h1>
      </div>

      <div className="space-y-4">
        {/* Identity */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identity</h2>

          <div>
            <label className={labelCls}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Monster name"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Danger Level</label>
              <input
                type="number"
                min="1"
                max="12"
                value={dangerLevel}
                onChange={(e) => setDangerLevel(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <div className="flex rounded overflow-hidden border border-gray-700 h-[34px]">
                {(['Standard', 'Elite'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
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
              <label className={labelCls}>Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as Monster['size'])}
                className={inputCls}
              >
                {(['Small', 'Medium', 'Large', 'Colossal'] as const).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Faction</label>
              <input
                type="text"
                value={faction}
                onChange={(e) => setFaction(e.target.value)}
                className={inputCls}
                placeholder="e.g. Crimson Horde"
              />
            </div>
            <div>
              <label className={labelCls}>XP Reward</label>
              <input
                type="number"
                min="0"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stats</h2>

          <div className="grid grid-cols-4 gap-3">
            {(
              [
                { label: 'HP', value: hp, set: setHp },
                { label: 'AR', value: ar, set: setAr },
                { label: 'DR', value: dr, set: setDr },
                { label: 'MR', value: mr, set: setMr },
                { label: 'AV', value: av, set: setAv },
                { label: 'SPD', value: spd, set: setSpd },
                { label: 'DMG +', value: dmg, set: setDmg },
              ] as const
            ).map(({ label, value, set }) => (
              <div key={label}>
                <label className={labelCls}>{label}</label>
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className={labelCls}>Damage Die</label>
              <input
                type="text"
                value={damageDie}
                onChange={(e) => setDamageDie(e.target.value)}
                className={inputCls}
                placeholder="1d6"
              />
            </div>
          </div>
        </section>

        {/* Abilities */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-5">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Abilities</h2>

          <AbilitySection
            kind="trait"
            library={libraryTraits}
            selected={traitIds}
            draft={traitDraft}
            onToggle={(id) => toggleAbility(id, 'trait')}
            onStartNew={() => setTraitDraft(emptyDraft)}
            onCancelNew={() => setTraitDraft(null)}
            onCommitNew={(d) => commitNewAbility('trait', d)}
            onDraftChange={(d) => setTraitDraft(d)}
          />

          <div className="border-t border-gray-800 pt-5">
            <AbilitySection
              kind="power"
              library={libraryPowers}
              selected={powerIds}
              draft={powerDraft}
              onToggle={(id) => toggleAbility(id, 'power')}
              onStartNew={() => setPowerDraft(emptyDraft)}
              onCancelNew={() => setPowerDraft(null)}
              onCommitNew={(d) => commitNewAbility('power', d)}
              onDraftChange={(d) => setPowerDraft(d)}
            />
          </div>
        </section>

        {/* Extras */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Extras</h2>

          <div>
            <label className={labelCls}>Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputCls}
              placeholder="https://... or /monsters/filename.png"
            />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} resize-none`}
              placeholder="GM notes, tactics, lore..."
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pb-6">
          {onDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400">Delete this monster?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-xs px-3 py-1.5 rounded bg-red-800 hover:bg-red-700 text-white transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                Delete Monster
              </button>
            )
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
              name.trim()
                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Create Monster'}
          </button>
        </div>
      </div>
    </div>
  )
}
