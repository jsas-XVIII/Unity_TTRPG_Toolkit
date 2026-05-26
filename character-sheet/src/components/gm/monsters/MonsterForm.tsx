import { useState } from 'react'
import type { Monster, MonsterAttack } from '../../../types/monster'
import { uid } from '../../../utils/idGenerator'
import { getRangeForDL, getOutOfRange } from './dlRanges'
import type { RangeKey } from './dlRanges'
import MonsterBasicsSection from './MonsterBasicsSection'
import MonsterStatsSection from './MonsterStatsSection'
import type { StatField } from './MonsterStatsSection'
import MonsterAbilitiesSection from './MonsterAbilitiesSection'
import { FORM_INPUT, FORM_LABEL } from '../../../styles/classes'
import ConfirmButton from '../../ui/ConfirmButton'

interface Props {
  initial?: Monster
  onSave: (monster: Monster) => void
  onCancel: () => void
  onDelete?: () => void
}

// Full create/edit form for a homebrew monster including stats, attacks, abilities, and extras.
// [JSas | 2026-05-25] Modified: replaced local inputCls/labelCls with FORM_INPUT/FORM_LABEL; swapped inline confirm state for ConfirmButton
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
  const [might, setMight] = useState(String(initial?.might ?? 0))
  const [agility, setAgility] = useState(String(initial?.agility ?? 0))
  const [mind, setMind] = useState(String(initial?.mind ?? 0))
  const [presence, setPresence] = useState(String(initial?.presence ?? 0))
  const [attacks, setAttacks] = useState<MonsterAttack[]>(initial?.attacks ?? [])
  const [traitIds, setTraitIds] = useState<string[]>(initial?.traitIds ?? [])
  const [powerIds, setPowerIds] = useState<string[]>(initial?.powerIds ?? [])
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [showRangeWarning, setShowRangeWarning] = useState(false)

  const dlNum = Number(dangerLevel) || 1
  const dlRange = getRangeForDL(dlNum)
  const currentStats: Record<RangeKey, number> = {
    hp: Number(hp) || 0,
    ar: Number(ar) || 0,
    dr: Number(dr) || 0,
    mr: Number(mr) || 0,
    av: Number(av) || 0,
    spd: Number(spd) || 0,
    xp: Number(xp) || 0,
  }
  const outOfRange = getOutOfRange(dlNum, currentStats)

  function clearWarning() {
    setShowRangeWarning(false)
  }

  function applyBaseline() {
    const range = getRangeForDL(dlNum)
    if (!range) return
    setHp(String(range.hp[0]))
    setAr(String(range.ar[0]))
    setDr(String(range.dr[0]))
    setMr(String(range.mr[0]))
    setAv(String(range.av[0]))
    setSpd(String(range.spd[0]))
    setXp(String(range.xp[0]))
    setShowRangeWarning(false)
  }

  const statFields: StatField[] = [
    {
      label: 'HP',
      value: hp,
      onChange: (v) => {
        setHp(v)
        clearWarning()
      },
      rangeKey: 'hp',
    },
    {
      label: 'AR',
      value: ar,
      onChange: (v) => {
        setAr(v)
        clearWarning()
      },
      rangeKey: 'ar',
    },
    {
      label: 'DR',
      value: dr,
      onChange: (v) => {
        setDr(v)
        clearWarning()
      },
      rangeKey: 'dr',
    },
    {
      label: 'MR',
      value: mr,
      onChange: (v) => {
        setMr(v)
        clearWarning()
      },
      rangeKey: 'mr',
    },
    {
      label: 'AV',
      value: av,
      onChange: (v) => {
        setAv(v)
        clearWarning()
      },
      rangeKey: 'av',
    },
    {
      label: 'SPD',
      value: spd,
      onChange: (v) => {
        setSpd(v)
        clearWarning()
      },
      rangeKey: 'spd',
    },
  ]

  function addAttack() {
    setAttacks((prev) => [...prev, { name: '', range: 'Melee', damage: '' }])
  }

  function updateAttack(i: number, field: keyof MonsterAttack, value: string) {
    setAttacks((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)))
  }

  function removeAttack(i: number) {
    setAttacks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function saveMonster() {
    if (!name.trim()) return
    const monster: Monster = {
      id: initial?.id ?? `hb-${uid()}`,
      name: name.trim(),
      dangerLevel: dlNum,
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
      might: Number(might) || 0,
      agility: Number(agility) || 0,
      mind: Number(mind) || 0,
      presence: Number(presence) || 0,
      attacks,
      traitIds,
      powerIds,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    }
    onSave(monster)
  }

  function handleSubmit() {
    if (!name.trim()) return
    if (outOfRange.size > 0 && !showRangeWarning) {
      setShowRangeWarning(true)
      return
    }
    saveMonster()
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
        <MonsterBasicsSection
          name={name}
          onNameChange={setName}
          dangerLevel={dangerLevel}
          onDangerLevelChange={(v) => {
            setDangerLevel(v)
            clearWarning()
          }}
          type={type}
          onTypeChange={setType}
          size={size}
          onSizeChange={setSize}
          faction={faction}
          onFactionChange={setFaction}
          xp={xp}
          onXpChange={(v) => {
            setXp(v)
            clearWarning()
          }}
          xpOutOfRange={outOfRange.has('xp')}
          dlRange={dlRange}
          onApplyBaseline={applyBaseline}
        />

        <MonsterStatsSection statFields={statFields} outOfRange={outOfRange} dlRange={dlRange} />

        {/* Attributes */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attributes</h2>
          <div className="grid grid-cols-4 gap-3">
            {(
              [
                { label: 'Might', value: might, set: setMight },
                { label: 'Agility', value: agility, set: setAgility },
                { label: 'Mind', value: mind, set: setMind },
                { label: 'Presence', value: presence, set: setPresence },
              ] as { label: string; value: string; set: (v: string) => void }[]
            ).map(({ label, value, set }) => (
              <div key={label}>
                <label className={FORM_LABEL}>{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className={FORM_INPUT}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Attacks */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attacks</h2>
            <button
              type="button"
              onClick={addAttack}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              + Add Attack
            </button>
          </div>

          {attacks.length === 0 && <p className="text-xs text-gray-600 italic">No attacks yet.</p>}

          <div className="space-y-2">
            {attacks.map((atk, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  {i === 0 && <label className={FORM_LABEL}>Name</label>}
                  <input
                    type="text"
                    value={atk.name}
                    onChange={(e) => updateAttack(i, 'name', e.target.value)}
                    className={FORM_INPUT}
                    placeholder="e.g. Melee Attack"
                  />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className={FORM_LABEL}>Range</label>}
                  <input
                    type="text"
                    value={atk.range}
                    onChange={(e) => updateAttack(i, 'range', e.target.value)}
                    className={FORM_INPUT}
                    placeholder="e.g. Melee"
                  />
                </div>
                <div className="flex-1">
                  {i === 0 && <label className={FORM_LABEL}>Damage</label>}
                  <input
                    type="text"
                    value={atk.damage}
                    onChange={(e) => updateAttack(i, 'damage', e.target.value)}
                    className={FORM_INPUT}
                    placeholder="e.g. 1d8+4"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAttack(i)}
                  className={`text-gray-600 hover:text-red-400 transition-colors text-sm shrink-0 ${i === 0 ? 'mb-0' : ''}`}
                  style={{ paddingBottom: '6px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        <MonsterAbilitiesSection
          traitIds={traitIds}
          onTraitIdsChange={setTraitIds}
          powerIds={powerIds}
          onPowerIdsChange={setPowerIds}
        />

        {/* Extras */}
        <section className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Extras</h2>

          <div>
            <label className={FORM_LABEL}>Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={FORM_INPUT}
              placeholder="https://... or /monsters/filename.png"
            />
          </div>

          <div>
            <label className={FORM_LABEL}>Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${FORM_INPUT} resize-none`}
              placeholder="GM notes, tactics, lore..."
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pb-6">
          {onDelete ? (
            <div className="flex items-center gap-2">
              <ConfirmButton
                triggerLabel="Delete Monster"
                promptText="Delete this monster?"
                confirmLabel="Confirm"
                onConfirm={onDelete}
                triggerClassName="text-xs text-red-500 hover:text-red-400 transition-colors"
                promptClassName="text-xs text-red-400"
              />
            </div>
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

        {/* Out-of-range confirmation */}
        {showRangeWarning && outOfRange.size > 0 && (
          <div className="mb-6 p-4 bg-amber-950 border border-amber-700 rounded-lg">
            <p className="text-sm text-amber-300 font-semibold mb-1">
              {outOfRange.size} stat{outOfRange.size > 1 ? 's are' : ' is'} outside the recommended
              range for DL {dlNum}
            </p>
            <p className="text-xs text-amber-500 mb-3">
              These are guidelines — powerful or unique monsters may need higher values. Use "Apply
              baseline" above to reset stats to the suggested range.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowRangeWarning(false)}
                className="text-xs px-3 py-1.5 rounded border border-gray-600 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={saveMonster}
                className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
              >
                Save Anyway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
