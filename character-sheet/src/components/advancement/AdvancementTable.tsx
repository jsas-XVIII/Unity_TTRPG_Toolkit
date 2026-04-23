// AdvancementTable.tsx — Advancement tab content for the character sheet.
//
// Shows:
//   1. XP progress bar toward next level
//   2. Level Up button (auto-applies AR/DR, HP boost, Recuperation, Artifact Capacity)
//   3. Post-level-up checklist of choices that require manual action on the sheet
//   4. Full 10-row advancement table with current-level highlighting

import { useState } from 'react'
import type { Character } from '../../types/character'
import type { ClassDefinition } from '../../types/class'
import {
  ADVANCEMENT_ROWS,
  XP_THRESHOLDS,
  getArDrGainAtLevel,
  applyLevelUp,
} from '../../data/advancementData'
import InfoTooltip from '../ui/InfoTooltip'

interface Props {
  character: Character
  classDef: ClassDefinition
  onLevelUp: (updated: Character) => void
}

// Column header tooltip text
const TOOLTIPS = {
  hpBoost:
    'Max HP increases by your Recuperation Die maximum (e.g. d8 = 8) plus your current MIGHT score. Applied automatically.',
  corePathPoint:
    'Gain 1 point to spend on an existing or new Core Path. Apply it manually in the Core Paths section.',
  attrBoost:
    'Permanently increase any one Attribute by +1. Apply it manually in the Attributes section.',
  recuperation: '+1 maximum Recuperation per rest. Applied automatically.',
  generalPerk: 'Choose 1 perk from the General Perks list. Add it manually in the Perks section.',
  artifactCapacity: '+1 maximum equipped Artifacts. Applied automatically.',
  t1Token:
    'Choose 1 new Tier I power or 1 upgrade to an existing Tier I power. Apply it in the Powers section.',
  t2Token:
    'Choose 1 new Tier II power or 1 upgrade to an existing Tier II power. Apply it in the Powers section.',
  arDr: "Attack Rating / Defense Rating bonus. Applied automatically. The gain amounts depend on your class's combat style: Balanced (+1/+1), Aggressive (+2/+0 or +1/+1), or Glass-cannon (+2/+0).",
}

function Dot() {
  return <span className="text-amber-400 font-bold">♦</span>
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-2 py-1.5 text-center text-sm">{children}</td>
}

export default function AdvancementTable({ character, classDef, onLevelUp }: Props) {
  const [checklist, setChecklist] = useState<string[]>([])

  const { level, xp, className } = character
  const nextLevel = level + 1
  const nextThreshold = nextLevel <= 10 ? XP_THRESHOLDS[nextLevel] : null
  const canLevelUp = level < 10 && nextThreshold !== null && xp >= nextThreshold

  const parseDieMax = (die: string) => {
    const m = die.match(/d(\d+)/)
    return m ? parseInt(m[1], 10) : 6
  }

  function handleLevelUp() {
    const result = applyLevelUp(character, classDef)
    onLevelUp(result.updated)
    setChecklist(result.checklist)
  }

  // XP progress toward next level
  const prevThreshold = XP_THRESHOLDS[level] ?? 0
  const progressXp = xp - prevThreshold
  const rangeXp = nextThreshold !== null ? nextThreshold - prevThreshold : 1
  const progressPct =
    nextThreshold !== null ? Math.min(100, Math.round((progressXp / rangeXp) * 100)) : 100

  return (
    <div className="space-y-4">
      {/* XP & Level Up */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Experience
            </span>
            <div className="text-lg font-bold text-gray-100 mt-0.5">{xp.toLocaleString()} XP</div>
            {level < 10 && nextThreshold !== null && (
              <div className="text-xs text-gray-400 mt-0.5">
                {nextThreshold.toLocaleString()} XP to reach Level {nextLevel} (
                {(nextThreshold - xp).toLocaleString()} remaining)
              </div>
            )}
            {level >= 10 && (
              <div className="text-xs text-amber-400 mt-0.5">Maximum level reached</div>
            )}
          </div>

          {level < 10 && (
            <button
              onClick={handleLevelUp}
              disabled={!canLevelUp}
              className={`px-5 py-2 rounded font-semibold text-sm transition-colors ${
                canLevelUp
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Level Up → {nextLevel}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {level < 10 && nextThreshold !== null && (
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Post-level-up checklist */}
      {checklist.length > 0 && (
        <div className="bg-gray-900 border border-amber-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Pending Choices — Level {level}
            </h3>
            <button
              onClick={() => setChecklist([])}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs text-gray-400">
            The following require a manual choice on your sheet:
          </p>
          <ul className="space-y-1 w-full">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-gray-200 break-words min-w-0"
              >
                <span className="text-amber-400 mt-0.5">›</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advancement Table */}
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Class Advancement
          </h2>
          <span className="text-xs text-gray-500">— {className}</span>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-2 py-2 text-left font-semibold">Lv</th>
              <th className="px-2 py-2 text-right font-semibold">XP</th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                HP Boost
                <InfoTooltip text={TOOLTIPS.hpBoost} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                Path Pt
                <InfoTooltip text={TOOLTIPS.corePathPoint} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                Attr +1
                <InfoTooltip text={TOOLTIPS.attrBoost} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                Recup
                <InfoTooltip text={TOOLTIPS.recuperation} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                Perk
                <InfoTooltip text={TOOLTIPS.generalPerk} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                Artifact
                <InfoTooltip text={TOOLTIPS.artifactCapacity} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                T1
                <InfoTooltip text={TOOLTIPS.t1Token} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                T2
                <InfoTooltip text={TOOLTIPS.t2Token} />
              </th>
              <th className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                AR/DR
                <InfoTooltip text={TOOLTIPS.arDr} />
              </th>
            </tr>
          </thead>
          <tbody>
            {ADVANCEMENT_ROWS.map((row) => {
              const isReached = row.level <= level
              const isCurrent = row.level === level
              const threshold = XP_THRESHOLDS[row.level]
              const [arGain, drGain] = getArDrGainAtLevel(className, row.level)
              const hasArDr = arGain > 0 || drGain > 0

              // HP boost preview: show formula for next level, actual gain for reached levels
              const dieMax = parseDieMax(character.recuperationDie)
              const hpBoostLabel = row.hpBoost ? `+${dieMax + character.attributes.might}` : null

              return (
                <tr
                  key={row.level}
                  className={`border-b border-gray-800 transition-colors ${
                    isCurrent
                      ? 'bg-amber-900/30 border-amber-800/50'
                      : isReached
                        ? 'bg-gray-800/40 text-gray-300'
                        : 'text-gray-500'
                  }`}
                >
                  {/* Level */}
                  <td className="px-2 py-1.5 font-bold text-left">
                    <span
                      className={
                        isCurrent ? 'text-amber-400' : isReached ? 'text-gray-200' : 'text-gray-600'
                      }
                    >
                      {row.level}
                    </span>
                    {isCurrent && (
                      <span className="ml-1.5 text-[10px] text-amber-500 font-normal">◄</span>
                    )}
                  </td>

                  {/* XP threshold */}
                  <td
                    className={`px-2 py-1.5 text-right tabular-nums ${isReached ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {threshold !== null ? threshold.toLocaleString() : '—'}
                  </td>

                  {/* HP Boost */}
                  <Cell>
                    {row.hpBoost ? (
                      isReached ? (
                        <span className="text-green-400">{hpBoostLabel}</span>
                      ) : (
                        <Dot />
                      )
                    ) : null}
                  </Cell>

                  {/* Core Path Point */}
                  <Cell>{row.corePathPoint ? <Dot /> : null}</Cell>

                  {/* Attr Boost */}
                  <Cell>{row.attrBoost ? <Dot /> : null}</Cell>

                  {/* Recuperation */}
                  <Cell>{row.recuperation ? <Dot /> : null}</Cell>

                  {/* General Perk */}
                  <Cell>{row.generalPerk ? <Dot /> : null}</Cell>

                  {/* Artifact Capacity */}
                  <Cell>{row.artifactCapacity ? <Dot /> : null}</Cell>

                  {/* T1 Token */}
                  <Cell>{row.t1Token ? <Dot /> : null}</Cell>

                  {/* T2 Token */}
                  <Cell>{row.t2Token ? <Dot /> : null}</Cell>

                  {/* AR/DR */}
                  <Cell>
                    {hasArDr ? (
                      <span className={isReached ? 'text-sky-400' : ''}>
                        +{arGain}/+{drGain}
                      </span>
                    ) : null}
                  </Cell>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>
            <span className="text-amber-400 font-bold">♦</span> — Gained at this level
          </span>
          <span>
            <span className="text-amber-400">◄</span> — Current level
          </span>
          <span>
            <span className="text-green-400">+N</span> — HP gained (die max + MIGHT)
          </span>
          <span>
            <span className="text-sky-400">+N/+N</span> — AR/DR gained
          </span>
        </div>
      </div>
    </div>
  )
}
