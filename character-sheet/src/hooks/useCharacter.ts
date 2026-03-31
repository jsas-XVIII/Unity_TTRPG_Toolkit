import { useReducer, useCallback } from 'react'
import type { Character, Power, CorePath, Perk } from '../types/character'
import type { Weapon, ArmorItem, Artifact } from '../types/equipment'
import { CLASS_MAP } from '../constants/classes'
import { computeDerivedStats, type DerivedStats } from '../utils/derivedStats'

type Action =
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'SET_FIELD'; field: keyof Character; value: unknown }
  | { type: 'SET_ATTRIBUTE'; attr: 'might' | 'agility' | 'mind' | 'presence'; value: number }
  | { type: 'SET_HP'; value: number }
  | { type: 'SET_FADING'; value: number }
  | { type: 'SET_PRIMARY_RESOURCE'; current: number }
  | { type: 'SET_SECONDARY_RESOURCE'; current: number }
  | { type: 'ADD_WEAPON'; weapon: Weapon }
  | { type: 'REMOVE_WEAPON'; id: string }
  | { type: 'ADD_ARMOR'; armor: ArmorItem }
  | { type: 'REMOVE_ARMOR'; id: string }
  | { type: 'ADD_ARTIFACT'; artifact: Artifact }
  | { type: 'REMOVE_ARTIFACT'; id: string }
  | { type: 'TOGGLE_ARTIFACT_EQUIPPED'; id: string }
  | { type: 'ADD_POWER'; power: Power }
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }
  | { type: 'ADD_PERK'; perk: Perk }
  | { type: 'REMOVE_PERK'; id: string }
  | { type: 'SET_CORE_PATH'; path: CorePath }
  | { type: 'ADD_CORE_PATH'; path: CorePath }
  | { type: 'REMOVE_CORE_PATH'; id: string }

function reducer(state: Character, action: Action): Character {
  switch (action.type) {
    case 'SET_CHARACTER':
      return action.payload

    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    case 'SET_ATTRIBUTE':
      return { ...state, attributes: { ...state.attributes, [action.attr]: action.value } }

    case 'SET_HP':
      return { ...state, currentHp: action.value }

    case 'SET_FADING':
      return { ...state, fadingStacks: Math.min(5, Math.max(0, action.value)) }

    case 'SET_PRIMARY_RESOURCE':
      return {
        ...state,
        primaryResource: { ...state.primaryResource, current: action.current },
      }

    case 'SET_SECONDARY_RESOURCE':
      if (!state.secondaryResource) return state
      return {
        ...state,
        secondaryResource: { ...state.secondaryResource, current: action.current },
      }

    case 'ADD_WEAPON':
      return { ...state, weapons: [...state.weapons, action.weapon] }

    case 'REMOVE_WEAPON':
      return { ...state, weapons: state.weapons.filter((w) => w.id !== action.id) }

    case 'ADD_ARMOR':
      return { ...state, armor: [...state.armor, action.armor] }

    case 'REMOVE_ARMOR':
      return { ...state, armor: state.armor.filter((a) => a.id !== action.id) }

    case 'ADD_ARTIFACT':
      return { ...state, artifacts: [...state.artifacts, action.artifact] }

    case 'REMOVE_ARTIFACT':
      return { ...state, artifacts: state.artifacts.filter((a) => a.id !== action.id) }

    case 'TOGGLE_ARTIFACT_EQUIPPED':
      return {
        ...state,
        artifacts: state.artifacts.map((a) =>
          a.id === action.id ? { ...a, equipped: !a.equipped } : a
        ),
      }

    case 'ADD_POWER':
      return { ...state, powers: [...state.powers, action.power] }

    case 'REMOVE_POWER':
      return { ...state, powers: state.powers.filter((p) => p.id !== action.id) }

    case 'TOGGLE_UPGRADE':
      return {
        ...state,
        powers: state.powers.map((p) =>
          p.id === action.powerId
            ? {
                ...p,
                upgrades: p.upgrades.map((u) =>
                  u.id === action.upgradeId ? { ...u, purchased: !u.purchased } : u
                ),
              }
            : p
        ),
      }

    case 'ADD_PERK':
      return { ...state, perks: [...state.perks, action.perk] }

    case 'REMOVE_PERK':
      return { ...state, perks: state.perks.filter((p) => p.id !== action.id) }

    case 'SET_CORE_PATH':
      return {
        ...state,
        corePaths: state.corePaths.map((cp) => (cp.id === action.path.id ? action.path : cp)),
      }

    case 'ADD_CORE_PATH':
      return { ...state, corePaths: [...state.corePaths, action.path] }

    case 'REMOVE_CORE_PATH':
      return { ...state, corePaths: state.corePaths.filter((cp) => cp.id !== action.id) }

    default:
      return state
  }
}

export function useCharacter(initial: Character) {
  const [character, dispatch] = useReducer(reducer, initial)

  const classDef = CLASS_MAP[character.className]
  const derived: DerivedStats = classDef
    ? computeDerivedStats(character, classDef)
    : { ar: 0, dr: 0, mr: 0, speed: 0, av: 0, maxHp: 0, maxRecuperations: 2, hl: 1 }

  const setCharacter = useCallback(
    (c: Character) => dispatch({ type: 'SET_CHARACTER', payload: c }),
    []
  )

  return { character, derived, dispatch, setCharacter }
}
