import { useState, useRef } from 'react'
import type { DiceType, BenHinState, AttributeKey, RollResult } from '../../types/dice'
import type { DerivedStats } from '../../utils/derivedStats'
import type { Attributes } from '../../types/character'
import {
  buildRollResult,
  buildRoll20Macro,
  quickAttackRoll,
  quickDefenseRoll,
  quickMindResistRoll,
} from '../../utils/dice'
import { playTick, playSettle } from '../../utils/diceAudio'

const DICE_OPTIONS: DiceType[] = ['2d10', 'd4', 'd6', 'd8', 'd10', 'd12', '2d6']

const TUMBLE_INTERVAL_MS = 60
const TUMBLE_DURATION_MS = 500

function dieSides(type: DiceType): number {
  if (type === 'd4') return 4
  if (type === 'd6' || type === '2d6') return 6
  if (type === 'd8') return 8
  if (type === 'd12') return 12
  return 10 // 2d10, d10
}

function randomDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)
}
const ATTRIBUTE_OPTIONS: { key: AttributeKey; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'might', label: 'Might' },
  { key: 'agility', label: 'Agility' },
  { key: 'mind', label: 'Mind' },
  { key: 'presence', label: 'Presence' },
]

interface Props {
  characterId: string
  attributes: Attributes
  derived: DerivedStats
  onRoll: (result: RollResult) => void
}

function ResultDisplay({
  result,
  tumblingDice,
}: {
  result: RollResult
  tumblingDice: number[] | null
}) {
  const isSettled = tumblingDice === null

  function DiceChip({ value, isDropped }: { value: number; isDropped: boolean }) {
    return (
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold font-mono border transition-colors ${
          isDropped
            ? 'border-gray-700 bg-gray-800 text-gray-500 line-through'
            : isSettled && result.isCrit
              ? 'border-amber-500 bg-amber-900/40 text-amber-200'
              : 'border-gray-600 bg-gray-700 text-gray-100'
        }`}
      >
        {value}
      </span>
    )
  }

  const droppedCount = result.allDice.length - result.keptDice.length
  let chips: JSX.Element[]
  if (tumblingDice) {
    chips = tumblingDice.map((v, i) => <DiceChip key={i} value={v} isDropped={false} />)
  } else {
    const remainingKept = [...result.keptDice]
    chips = result.allDice.map((v, i) => {
      const idx = remainingKept.indexOf(v)
      const isKept = idx !== -1
      if (isKept) remainingKept.splice(idx, 1)
      return <DiceChip key={i} value={v} isDropped={!isKept} />
    })
  }

  const bonusParts: string[] = []
  if (result.attributeBonus !== 0)
    bonusParts.push(`${result.attributeBonus > 0 ? '+' : ''}${result.attributeBonus} attr`)
  if (result.halfLevelBonus !== 0) bonusParts.push(`+${result.halfLevelBonus} HL`)
  if (result.miscBonus !== 0)
    bonusParts.push(`${result.miscBonus > 0 ? '+' : ''}${result.miscBonus} misc`)

  return (
    <div
      className={`rounded-lg p-3 border transition-colors ${
        isSettled && result.isCrit
          ? 'border-amber-500 bg-amber-950/30'
          : 'border-gray-700 bg-gray-800'
      }`}
    >
      {isSettled && result.isCrit && (
        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
          Critical Hit!
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {chips}
        {isSettled && droppedCount > 0 && (
          <span className="text-xs text-gray-500 ml-1">
            ({result.benHin === 'benefit' ? 'keep 2 highest' : 'keep 2 lowest'})
          </span>
        )}
      </div>
      {bonusParts.length > 0 && (
        <p className="text-xs text-gray-400 mb-1">{bonusParts.join(', ')}</p>
      )}
      <p className="text-2xl font-bold text-amber-400">
        {isSettled ? (
          <>
            {result.total}
            {result.label && (
              <span className="text-sm font-normal text-gray-400 ml-2">— {result.label}</span>
            )}
          </>
        ) : (
          <span className="text-gray-500">—</span>
        )}
      </p>
    </div>
  )
}

export default function RollTab({ characterId, attributes, derived, onRoll }: Props) {
  const [benHin, setBenHin] = useState<BenHinState>('normal')
  const [dice, setDice] = useState<DiceType>('2d10')
  const [attributeKey, setAttributeKey] = useState<AttributeKey>('none')
  const [useHalfLevel, setUseHalfLevel] = useState(false)
  const [miscBonus, setMiscBonus] = useState(0)
  const [label, setLabel] = useState('')
  const [lastResult, setLastResult] = useState<RollResult | null>(null)
  const [tumblingDice, setTumblingDice] = useState<number[] | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const is2d10 = dice === '2d10'

  function computeTotalBonus(): number {
    const attr = attributeKey !== 'none' ? attributes[attributeKey] : 0
    const hl = is2d10 && useHalfLevel ? derived.hl : 0
    return attr + hl + miscBonus
  }

  function startTumble(result: RollResult) {
    if (timerRef.current) clearInterval(timerRef.current)

    const sides = dieSides(result.dice)
    const count = result.allDice.length

    setLastResult(result)
    setIsRolling(true)
    setTumblingDice(randomDice(count, sides))
    onRoll(result)
    playTick()

    let elapsed = 0
    timerRef.current = setInterval(() => {
      elapsed += TUMBLE_INTERVAL_MS
      if (elapsed >= TUMBLE_DURATION_MS) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        setTumblingDice(null)
        setIsRolling(false)
        playSettle()
      } else {
        setTumblingDice(randomDice(count, sides))
        playTick()
      }
    }, TUMBLE_INTERVAL_MS)
  }

  function handleRoll() {
    const result = buildRollResult({
      characterId,
      label,
      dice,
      benHin: is2d10 ? benHin : 'normal',
      attributeKey,
      useHalfLevel: is2d10 ? useHalfLevel : false,
      miscBonus,
      attributes,
      derived,
    })
    startTumble(result)
  }

  function handleQuickRoll(fn: () => RollResult) {
    startTumble(fn())
  }

  async function handleCopyMacro() {
    const macro = buildRoll20Macro({
      dice,
      benHin: is2d10 ? benHin : 'normal',
      totalBonus: computeTotalBonus(),
      label,
    })
    await navigator.clipboard.writeText(macro)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SELECT_CLASS =
    'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500'

  return (
    <div className="space-y-4">
      {/* Quick rolls */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Quick Roll</p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 font-medium"
            onClick={() =>
              handleQuickRoll(() => quickAttackRoll(characterId, attributes, derived, benHin))
            }
          >
            Attack <span className="text-gray-400 text-xs">2d10+{derived.ar}</span>
          </button>
          <button
            className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 font-medium"
            onClick={() =>
              handleQuickRoll(() => quickDefenseRoll(characterId, attributes, derived, benHin))
            }
          >
            Defense <span className="text-gray-400 text-xs">2d10+{derived.dr}</span>
          </button>
          <button
            className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 font-medium"
            onClick={() =>
              handleQuickRoll(() => quickMindResistRoll(characterId, attributes, derived, benHin))
            }
          >
            Mind Resist <span className="text-gray-400 text-xs">2d10+{derived.mr}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800" />

      {/* Custom roll form */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Custom Roll</p>

        <div className="grid grid-cols-2 gap-3">
          {/* Dice */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Dice</label>
            <select
              className={`${SELECT_CLASS} w-full`}
              value={dice}
              onChange={(e) => setDice(e.target.value as DiceType)}
            >
              {DICE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Attribute */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Attribute</label>
            <select
              className={`${SELECT_CLASS} w-full`}
              value={attributeKey}
              onChange={(e) => setAttributeKey(e.target.value as AttributeKey)}
            >
              {ATTRIBUTE_OPTIONS.map(({ key, label: lbl }) => (
                <option key={key} value={key}>
                  {lbl}
                  {key !== 'none' ? ` (${attributes[key]})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Misc bonus */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Misc Bonus</label>
            <input
              type="number"
              className={`${SELECT_CLASS} w-full`}
              value={miscBonus}
              onChange={(e) => setMiscBonus(parseInt(e.target.value, 10) || 0)}
            />
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Label (optional)</label>
            <input
              type="text"
              className={`${SELECT_CLASS} w-full`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Fireball"
            />
          </div>
        </div>

        {/* 2d10-only options */}
        {is2d10 && (
          <div className="mt-3 space-y-2">
            {/* Benefit / Hindrance toggle */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Advantage</p>
              <div className="flex gap-1">
                {(['normal', 'benefit', 'hindrance'] as BenHinState[]).map((state) => (
                  <button
                    key={state}
                    onClick={() => setBenHin(state)}
                    className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                      benHin === state
                        ? state === 'benefit'
                          ? 'bg-green-700 text-white'
                          : state === 'hindrance'
                            ? 'bg-red-800 text-white'
                            : 'bg-amber-700 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>

            {/* Half Level */}
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                className="accent-amber-500"
                checked={useHalfLevel}
                onChange={(e) => setUseHalfLevel(e.target.checked)}
              />
              <span className="text-sm text-gray-300">
                Half Level <span className="text-gray-500">(+{derived.hl})</span>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-4 py-2 rounded bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRoll}
          disabled={isRolling}
        >
          {isRolling ? 'Rolling…' : 'Roll'}
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          onClick={handleCopyMacro}
          title="Copy Roll20 macro to clipboard"
        >
          {copied ? 'Copied!' : 'Roll20 Macro'}
        </button>
      </div>

      {/* Result */}
      {lastResult && <ResultDisplay result={lastResult} tumblingDice={tumblingDice} />}
    </div>
  )
}
