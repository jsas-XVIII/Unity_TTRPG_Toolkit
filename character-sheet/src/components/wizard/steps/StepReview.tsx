import { RACE_MAP } from '../../../constants/races'
import { CLASS_MAP } from '../../../constants/classes'
import { RACE_MAP as RACES_MAP } from '../../../constants/races'
import { getPowerById } from '../../../data/powersData'
import type { WizardDraft } from '../WizardTypes'
import type { Attributes } from '../../../types/character'

interface Props {
  draft: WizardDraft
}

const ATTR_KEYS: (keyof Attributes)[] = ['might', 'agility', 'mind', 'presence']
const ATTR_LABELS: Record<keyof Attributes, string> = {
  might: 'MIGHT',
  agility: 'AGILITY',
  mind: 'MIND',
  presence: 'PRESENCE',
}

function finalAttr(draft: WizardDraft, attr: keyof Attributes): number {
  const racial = draft.race ? RACE_MAP[draft.race].baseAttributes[attr] : 0
  const mod = draft.attrAssignments[attr] ?? 0
  return racial + mod
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  )
}

export default function StepReview({ draft }: Props) {
  const classDef = draft.className ? CLASS_MAP[draft.className] : null
  const raceDef = draft.race ? RACES_MAP[draft.race] : null

  const might = finalAttr(draft, 'might')
  const maxHp = classDef ? classDef.hpBase + might : '?'
  const maxRecup = 2 + Math.floor(might / 2)

  const selectedPath = classDef?.classPaths?.find((p) => p.id === draft.classPath)
  const selectedPerk = classDef?.classPerks.find((p) => p.id === draft.selectedPerkId)
  const spentDenerim = [
    ...draft.weapons.map((w) => w.cost),
    ...draft.armor.map((a) => a.cost),
  ].reduce((s, c) => s + c, 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Review & Confirm</h2>
        <p className="text-sm text-gray-400">
          Check everything looks right before creating your character.
        </p>
      </div>

      <Section title="Identity">
        <div className="bg-gray-800 rounded-lg px-4 py-3 space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Name</span>
            <span className="text-white font-semibold">{draft.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Race</span>
            <span className="text-white">{draft.race ?? '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Class</span>
            <span className="text-white">
              {draft.className ?? '—'}
              {selectedPath && (
                <span className="text-amber-400 ml-1">({selectedPath.name})</span>
              )}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Age</span>
            <span className="text-white">{draft.age || '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Denerim</span>
            <span className="text-amber-400">{draft.startingDenerim - spentDenerim} remaining</span>
          </div>
        </div>
      </Section>

      <Section title="Attributes">
        <div className="grid grid-cols-4 gap-2">
          {ATTR_KEYS.map((attr) => {
            const val = finalAttr(draft, attr)
            return (
              <div key={attr} className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">{ATTR_LABELS[attr]}</div>
                <div
                  className={`text-xl font-bold ${val > 0 ? 'text-amber-400' : val < 0 ? 'text-red-400' : 'text-white'}`}
                >
                  {val > 0 ? `+${val}` : val}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Computed Stats">
        <div className="bg-gray-800 rounded-lg px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500">Max HP</span>
            <span className="text-white font-semibold">{maxHp}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">Max Recups</span>
            <span className="text-white font-semibold">{maxRecup}</span>
          </div>
          {classDef && (
            <>
              <div className="flex gap-2">
                <span className="text-gray-500">{classDef.primaryResourceName}</span>
                <span className="text-white font-semibold">{classDef.primaryResourceMax}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500">Recup Die</span>
                <span className="text-white font-semibold">{classDef.recuperationDie}</span>
              </div>
            </>
          )}
        </div>
      </Section>

      {raceDef && (
        <Section title="Racial Power">
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm">
            <span className="text-amber-300 font-semibold">{raceDef.racialPowerName}: </span>
            <span className="text-gray-400">{raceDef.racialPowerDescription}</span>
          </div>
        </Section>
      )}

      <Section title="Core Paths">
        <div className="space-y-1">
          {draft.corePaths.map((cp) => (
            <div key={cp.id} className="bg-gray-800 rounded px-3 py-2 flex gap-3 text-sm">
              <span className="text-amber-400 font-bold w-4 text-center">{cp.points}</span>
              <span className="text-white font-semibold">{cp.name}</span>
            </div>
          ))}
        </div>
      </Section>

      {selectedPerk && (
        <Section title="Class Perk">
          <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm">
            <span className="text-white font-semibold">{selectedPerk.name}: </span>
            <span className="text-gray-400">{selectedPerk.description}</span>
          </div>
        </Section>
      )}

      {draft.powers.length > 0 && (
        <Section title={`Powers (${draft.powers.length})`}>
          <div className="space-y-1">
            {draft.powers.map((p) => {
              const resolved = getPowerById(p.id)?.power
              return (
                <div key={p.id} className="bg-gray-800 rounded px-3 py-2 flex gap-3 text-sm">
                  <span className="text-xs text-gray-500 font-mono pt-0.5">
                    {resolved?.actionType ?? '?'}
                  </span>
                  <span className="text-white">
                    {resolved?.name ?? <em className="text-gray-600">Unknown power</em>}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {(draft.weapons.length > 0 || draft.armor.length > 0) && (
        <Section title="Equipment">
          <div className="space-y-1">
            {draft.weapons.map((w) => (
              <div key={w.id} className="bg-gray-800 rounded px-3 py-1.5 text-sm flex gap-2">
                <span className="text-white">{w.name}</span>
                <span className="text-gray-500">{w.damageDie}</span>
              </div>
            ))}
            {draft.armor.map((a) => (
              <div key={a.id} className="bg-gray-800 rounded px-3 py-1.5 text-sm flex gap-2">
                <span className="text-white">{a.name}</span>
                <span className="text-gray-500">+{a.av} AV</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-300">
        Click <strong>Create Character</strong> below to finish. You can edit everything on the
        sheet afterwards.
      </div>
    </div>
  )
}
