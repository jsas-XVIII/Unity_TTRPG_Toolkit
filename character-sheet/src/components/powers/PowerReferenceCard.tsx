import { useState } from 'react'
import type { Power } from '../../types/character'
import type { ClassName } from '../../data/powersData'
import { TIER_CONFIG } from '../../data/powersData'
import PowerEffectsText from './PowerEffectsText'

interface Props {
  power: Power
  className: ClassName
  onRemove?: () => void
  onUpgradeToggle?: (upgradeId: string) => void
}

const CLASS_COLORS: Record<ClassName, { header: string; accent: string; border: string }> = {
  Dreadnought: { header: 'bg-red-900', accent: 'text-red-900', border: 'border-red-900' },
  Driftwalker: { header: 'bg-purple-900', accent: 'text-purple-900', border: 'border-purple-900' },
  'Fell Hunter': { header: 'bg-green-800', accent: 'text-green-800', border: 'border-green-800' },
  Judge: { header: 'bg-amber-800', accent: 'text-amber-800', border: 'border-amber-800' },
  Mystic: { header: 'bg-teal-700', accent: 'text-teal-700', border: 'border-teal-700' },
  Phantom: { header: 'bg-zinc-700', accent: 'text-zinc-700', border: 'border-zinc-700' },
  Priest: { header: 'bg-sky-800', accent: 'text-sky-800', border: 'border-sky-800' },
  Primalist: { header: 'bg-emerald-800', accent: 'text-emerald-800', border: 'border-emerald-800' },
  Sentinel: { header: 'bg-blue-900', accent: 'text-blue-900', border: 'border-blue-900' },
}

const ACTION_LABEL: Record<string, string> = {
  Standard: 'STANDARD',
  Quick: 'QUICK',
  Movement: 'MOVEMENT',
  Free: 'FREE',
  Reaction: 'REACTION',
  Maintain: 'MAINTAIN',
  Overdrive: 'OVERDRIVE',
  Ultimate: 'ULTIMATE',
  Passive: 'PASSIVE',
}

export default function PowerReferenceCard({ power, className, onRemove, onUpgradeToggle }: Props) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const colors = CLASS_COLORS[className]
  const isPassive = power.actionType === 'Passive'
  const showStats = !isPassive && power.cost !== 'None'

  return (
    <div
      className={`w-64 rounded overflow-hidden shadow-xl border-2 ${colors.border} flex flex-col`}
    >
      {/* Header band */}
      <div className={`${colors.header} px-3 pt-3 pb-2`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-bold text-base uppercase tracking-wide leading-tight">
            {power.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <span className="text-white/60 text-xs font-bold">{TIER_CONFIG[power.tier].label}</span>
            {onRemove && !confirmingRemove && (
              <button
                onClick={() => setConfirmingRemove(true)}
                className="text-white/40 hover:text-white/90 text-sm leading-none"
                aria-label="Remove power"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <p className="text-white/70 text-xs uppercase tracking-widest mt-1">
          {ACTION_LABEL[power.actionType] ?? power.actionType}
        </p>
      </div>

      {/* Remove confirmation banner */}
      {confirmingRemove && (
        <div className="bg-red-950 border-t border-red-800 px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-red-300 text-[11px]">Remove this power?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onRemove!()
                setConfirmingRemove(false)
              }}
              className="text-[11px] font-bold text-red-300 hover:text-red-100"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmingRemove(false)}
              className="text-[11px] text-white/50 hover:text-white/90"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      {showStats && (
        <div className={`${colors.header} border-t border-white/20 grid grid-cols-3`}>
          <div className="px-2 py-1.5 text-center border-r border-white/20">
            <p className="text-white/50 text-[9px] uppercase tracking-widest">Cost</p>
            <p className="text-white text-[10px] font-bold leading-tight">{power.cost}</p>
          </div>
          <div className="px-2 py-1.5 text-center border-r border-white/20">
            <p className="text-white/50 text-[9px] uppercase tracking-widest">Target</p>
            <p className="text-white text-[10px] font-bold leading-tight">{power.target}</p>
          </div>
          <div className="px-2 py-1.5 text-center">
            <p className="text-white/50 text-[9px] uppercase tracking-widest">Range</p>
            <p className="text-white text-[10px] font-bold leading-tight">{power.range}</p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="bg-stone-50 flex-1 px-3 py-2.5 space-y-2.5">
        {/* Effects */}
        <div>
          <p
            className={`${colors.accent} text-[9px] font-bold uppercase tracking-widest border-b ${colors.border} border-opacity-40 pb-0.5 mb-1.5`}
          >
            Effects
          </p>
          <p className="text-gray-800 text-[11px] leading-snug">
            <PowerEffectsText
              text={power.effectsText}
              accentClass={colors.accent}
              borderClass={colors.border}
            />
          </p>
        </div>

        {/* Upgrades */}
        {power.upgrades.length > 0 && (
          <div>
            <p
              className={`${colors.accent} text-[9px] font-bold uppercase tracking-widest border-b ${colors.border} border-opacity-40 pb-0.5 mb-1.5`}
            >
              Upgrades
            </p>
            <ul className="space-y-1">
              {power.upgrades.map((u) => (
                <li key={u.id} className="text-[11px] text-gray-700 leading-snug">
                  {onUpgradeToggle ? (
                    <label className="flex items-start gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={u.purchased}
                        onChange={() => onUpgradeToggle(u.id)}
                        className="mt-0.5 accent-amber-600 shrink-0"
                      />
                      <span className={u.purchased ? 'text-amber-700' : ''}>
                        <span className="font-bold text-gray-900">{u.name}.</span> {u.description}
                      </span>
                    </label>
                  ) : (
                    <>
                      <span className="font-bold text-gray-900">{u.name}.</span> {u.description}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer: class label */}
      <div className={`${colors.header} px-3 py-1`}>
        <p className="text-white/50 text-[9px] uppercase tracking-widest text-center">
          {className}
        </p>
      </div>
    </div>
  )
}
