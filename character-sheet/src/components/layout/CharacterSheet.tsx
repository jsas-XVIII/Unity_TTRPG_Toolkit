import type { Character } from '../../types/character'
import { useCharacter } from '../../hooks/useCharacter'

import SheetHeader from './SheetHeader'
import AttributeBlock from '../identity/AttributeBlock'
import DerivedStats from '../identity/DerivedStats'
import HPTracker from '../resources/HPTracker'
import ResourceTracker from '../resources/ResourceTracker'
import RecuperationTracker from '../resources/RecuperationTracker'
import CorePathList from '../paths/CorePathList'
import PowerList from '../powers/PowerList'
import PerkList from '../perks/PerkList'
import WeaponSlots from '../equipment/WeaponSlots'
import ArmorSlot from '../equipment/ArmorSlot'
import ArtifactList from '../equipment/ArtifactList'
import InventoryBlock from '../equipment/InventoryBlock'

interface Props {
  initial: Character
  onSave: (character: Character) => void
  onExport: (character: Character) => void
  onNewCharacter: () => void
}

export default function CharacterSheet({ initial, onSave, onExport, onNewCharacter }: Props) {
  const { character, derived, dispatch } = useCharacter(initial)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Zone 1: Header */}
      <SheetHeader character={character} dispatch={dispatch} />

      {/* Global controls */}
      <div className="flex gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
        <button
          className="px-4 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold"
          onClick={() => onSave(character)}
        >
          Save
        </button>
        <button
          className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm"
          onClick={() => onExport(character)}
        >
          Export JSON
        </button>
        <button
          className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm ml-auto"
          onClick={onNewCharacter}
        >
          New Character
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Zone 2: Core Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AttributeBlock attributes={character.attributes} dispatch={dispatch} />
          <DerivedStats derived={derived} />
        </div>

        {/* Zone 3: Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HPTracker
            currentHp={character.currentHp}
            maxHp={derived.maxHp}
            fadingStacks={character.fadingStacks}
            dispatch={dispatch}
          />
          <ResourceTracker
            primary={character.primaryResource}
            secondary={character.secondaryResource}
            dispatch={dispatch}
          />
          <RecuperationTracker
            maxRecuperations={derived.maxRecuperations}
            recuperationDie={character.recuperationDie}
          />
        </div>

        {/* Zone 4: Core Paths */}
        <CorePathList corePaths={character.corePaths} dispatch={dispatch} />

        {/* Zones 5 & 6: Powers + Perks side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PowerList powers={character.powers} dispatch={dispatch} />
          <PerkList perks={character.perks} dispatch={dispatch} />
        </div>

        {/* Zone 7: Equipment */}
        <div className="bg-gray-900 rounded-lg p-4 space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Equipment</h2>
          <WeaponSlots weapons={character.weapons} dispatch={dispatch} />
          <ArmorSlot armor={character.armor} dispatch={dispatch} />
          <ArtifactList
            artifacts={character.artifacts}
            artifactCapacity={character.artifactCapacity}
            dispatch={dispatch}
          />
          <InventoryBlock
            denerim={character.denerim}
            necessities={character.necessities}
            gear={character.gear}
            dispatch={dispatch}
          />
        </div>

        {/* Notes */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h2>
          <textarea
            className="w-full bg-gray-800 rounded p-2 text-sm text-gray-300 focus:outline-none focus:border-amber-500 border border-gray-700 resize-none"
            rows={4}
            value={character.notes}
            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
            placeholder="Campaign notes, background, relationships…"
          />
        </div>
      </div>
    </div>
  )
}
