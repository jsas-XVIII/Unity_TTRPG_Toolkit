import { useState } from 'react'
import type { MonsterAbility } from '../../../types/monster'
import { getAllAbilities } from '../../../data/monstersData'
import { addHomebrewAbility } from '../../../services/monsterStorage'
import { uid } from '../../../utils/idGenerator'
import MonsterAbilitySection, { type AbilityDraft } from './MonsterAbilitySection'

const emptyDraft: AbilityDraft = { name: '', description: '', ruinCost: '', recharge: '' }

interface Props {
  traitIds: string[]
  onTraitIdsChange: (ids: string[]) => void
  powerIds: string[]
  onPowerIdsChange: (ids: string[]) => void
}

export default function MonsterAbilitiesSection({
  traitIds,
  onTraitIdsChange,
  powerIds,
  onPowerIdsChange,
}: Props) {
  const [allAbilities, setAllAbilities] = useState(() => getAllAbilities())
  const [traitDraft, setTraitDraft] = useState<AbilityDraft | null>(null)
  const [powerDraft, setPowerDraft] = useState<AbilityDraft | null>(null)

  const libraryTraits = allAbilities.filter((a) => a.kind === 'trait')
  const libraryPowers = allAbilities.filter((a) => a.kind === 'power')

  function toggleAbility(id: string, kind: 'trait' | 'power') {
    if (kind === 'trait') {
      onTraitIdsChange(traitIds.includes(id) ? traitIds.filter((x) => x !== id) : [...traitIds, id])
    } else {
      onPowerIdsChange(powerIds.includes(id) ? powerIds.filter((x) => x !== id) : [...powerIds, id])
    }
  }

  function commitNewAbility(kind: 'trait' | 'power', draft: AbilityDraft) {
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
      onTraitIdsChange([...traitIds, ability.id])
      setTraitDraft(null)
    } else {
      onPowerIdsChange([...powerIds, ability.id])
      setPowerDraft(null)
    }
  }

  return (
    <section className="bg-gray-900 rounded-lg p-4 space-y-5">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Abilities</h2>

      <MonsterAbilitySection
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
        <MonsterAbilitySection
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
  )
}
