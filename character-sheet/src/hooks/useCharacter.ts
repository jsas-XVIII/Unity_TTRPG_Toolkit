// useCharacter.ts — central state hook for a character sheet session.
//
// Pattern: useReducer + pure reducer function.
// Components never mutate character data directly; they dispatch typed Action objects.
// The reducer returns a new Character object, React re-renders, and derived stats
// are recomputed in the hook body on every render.
//
// Why useReducer instead of useState?
// The character has many independent sub-fields. useReducer keeps all update logic
// in one place (the reducer below) rather than scattered across components.

import { useReducer, useCallback, useMemo } from 'react'
import type { Character, CharacterPower, CorePath, Perk } from '../types/character'
import type { Weapon, ArmorItem } from '../types/equipment'
import type { CharacterArtifact } from '../types/artifact'
import { CLASS_MAP } from '../constants/classes'
import { computeDerivedStats, type DerivedStats } from '../utils/derivedStats'
import { applyLevelUp } from '../data/advancementData'

// ---------------------------------------------------------------------------
// Action union type
// Each action variant maps to one specific state mutation in the reducer below.
// ---------------------------------------------------------------------------
type Action =
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'SET_FIELD'; field: keyof Character; value: unknown }
  | { type: 'LEVEL_UP' }
  | { type: 'SET_ATTRIBUTE'; attr: 'might' | 'agility' | 'mind' | 'presence'; value: number }
  | { type: 'SET_HP'; value: number }
  | { type: 'SET_FADING'; value: number }
  | { type: 'SET_PRIMARY_RESOURCE'; current: number }
  | { type: 'SET_SECONDARY_RESOURCE'; current: number }
  | { type: 'ADD_WEAPON'; weapon: Weapon }
  | { type: 'REMOVE_WEAPON'; id: string }
  | { type: 'ADD_ARMOR'; armor: ArmorItem }
  | { type: 'REMOVE_ARMOR'; id: string }
  | { type: 'EQUIP_ARTIFACT'; id: string }
  | { type: 'UNEQUIP_ARTIFACT'; id: string }
  | { type: 'TOGGLE_ARTIFACT_UPGRADE'; artifactId: string; upgradeId: string }
  | { type: 'ADD_POWER'; power: CharacterPower }
  | { type: 'REMOVE_POWER'; id: string }
  | { type: 'TOGGLE_UPGRADE'; powerId: string; upgradeId: string }
  | { type: 'TOGGLE_FEATURE_UPGRADE'; powerId: string; upgradeId: string }
  | { type: 'ADD_PERK'; perk: Perk }
  | { type: 'REMOVE_PERK'; id: string }
  | { type: 'SET_CORE_PATH'; path: CorePath }
  | { type: 'ADD_CORE_PATH'; path: CorePath }
  | { type: 'REMOVE_CORE_PATH'; id: string }
  | { type: 'TOGGLE_POWER_USED'; id: string }
  | { type: 'FULL_REST' }

// ---------------------------------------------------------------------------
// Reducer — pure function: (currentState, action) => nextState
// Spread syntax is used throughout so the original state object is never mutated.
// ---------------------------------------------------------------------------
function reducer(state: Character, action: Action): Character {
  switch (action.type) {
    // Replace the entire character (used when loading a different character)
    case 'SET_CHARACTER':
      return action.payload

    // Generic single top-level field update (e.g. name, notes, level)
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }

    // Apply all automatic level-up bonuses (AR/DR, HP boost, recuperation, artifact capacity).
    // Choice-based bonuses (attr boost, perk, token) are returned as a checklist by applyLevelUp()
    // and surfaced in the AdvancementTable UI — the reducer only handles the automatic portion.
    case 'LEVEL_UP': {
      const classDef = CLASS_MAP[state.className]
      if (!classDef || state.level >= 10) return state
      return applyLevelUp(state, classDef).updated
    }

    // Update one of the four core attributes; preserves the other three
    case 'SET_ATTRIBUTE':
      return { ...state, attributes: { ...state.attributes, [action.attr]: action.value } }

    case 'SET_HP':
      return { ...state, currentHp: action.value }

    // Clamps fading stacks to the valid range 0–5
    case 'SET_FADING':
      return { ...state, fadingStacks: Math.min(5, Math.max(0, action.value)) }

    case 'SET_PRIMARY_RESOURCE':
      return {
        ...state,
        primaryResource: { ...state.primaryResource, current: action.current },
      }

    // Guard: if this character has no secondary resource, do nothing
    case 'SET_SECONDARY_RESOURCE':
      if (!state.secondaryResource) return state
      return {
        ...state,
        secondaryResource: { ...state.secondaryResource, current: action.current },
      }

    // --- Equipment: append / filter pattern ---
    case 'ADD_WEAPON':
      return { ...state, weapons: [...state.weapons, action.weapon] }
    case 'REMOVE_WEAPON':
      return { ...state, weapons: state.weapons.filter((w) => w.id !== action.id) }

    case 'ADD_ARMOR':
      return { ...state, armor: [...state.armor, action.armor] }
    case 'REMOVE_ARMOR':
      return { ...state, armor: state.armor.filter((a) => a.id !== action.id) }

    case 'EQUIP_ARTIFACT': {
      if (state.equippedArtifacts.some((a) => a.id === action.id)) return state
      const newEntry: CharacterArtifact = { id: action.id, purchasedUpgradeIds: [] }
      return { ...state, equippedArtifacts: [...state.equippedArtifacts, newEntry] }
    }
    case 'UNEQUIP_ARTIFACT':
      return {
        ...state,
        equippedArtifacts: state.equippedArtifacts.filter((a) => a.id !== action.id),
      }
    case 'TOGGLE_ARTIFACT_UPGRADE':
      return {
        ...state,
        equippedArtifacts: state.equippedArtifacts.map((a) => {
          if (a.id !== action.artifactId) return a
          const already = a.purchasedUpgradeIds.includes(action.upgradeId)
          return {
            ...a,
            purchasedUpgradeIds: already
              ? a.purchasedUpgradeIds.filter((uid) => uid !== action.upgradeId)
              : [...a.purchasedUpgradeIds, action.upgradeId],
          }
        }),
      }

    // --- Powers ---
    case 'ADD_POWER':
      return { ...state, powers: [...state.powers, action.power] }
    case 'REMOVE_POWER':
      return { ...state, powers: state.powers.filter((p) => p.id !== action.id) }

    // Toggles an upgrade ID in/out of purchasedUpgradeIds for the matching power
    case 'TOGGLE_UPGRADE':
      return {
        ...state,
        powers: state.powers.map((p) => {
          if (p.id !== action.powerId) return p
          const already = p.purchasedUpgradeIds.includes(action.upgradeId)
          return {
            ...p,
            purchasedUpgradeIds: already
              ? p.purchasedUpgradeIds.filter((uid) => uid !== action.upgradeId)
              : [...p.purchasedUpgradeIds, action.upgradeId],
          }
        }),
      }

    // Toggles an upgrade ID in/out of featureUpgrades for a derived feature power
    // (baseline / lv3 / lv8 / lv10). These are never stored in character.powers.
    case 'TOGGLE_FEATURE_UPGRADE': {
      const current = state.featureUpgrades ?? {}
      const existing = current[action.powerId] ?? []
      const already = existing.includes(action.upgradeId)
      return {
        ...state,
        featureUpgrades: {
          ...current,
          [action.powerId]: already
            ? existing.filter((uid) => uid !== action.upgradeId)
            : [...existing, action.upgradeId],
        },
      }
    }

    // --- Perks ---
    case 'ADD_PERK':
      return { ...state, perks: [...state.perks, action.perk] }
    case 'REMOVE_PERK':
      return { ...state, perks: state.perks.filter((p) => p.id !== action.id) }

    // --- Core Paths ---
    // SET replaces an existing path in-place (e.g. renaming or adjusting points)
    case 'SET_CORE_PATH':
      return {
        ...state,
        corePaths: state.corePaths.map((cp) => (cp.id === action.path.id ? action.path : cp)),
      }
    case 'ADD_CORE_PATH':
      return { ...state, corePaths: [...state.corePaths, action.path] }
    case 'REMOVE_CORE_PATH':
      return { ...state, corePaths: state.corePaths.filter((cp) => cp.id !== action.id) }

    // Toggles a power ID in/out of usedPowerIds (Overdrive/Ultimate per-rest tracking)
    case 'TOGGLE_POWER_USED': {
      const used = state.usedPowerIds ?? []
      const already = used.includes(action.id)
      return {
        ...state,
        usedPowerIds: already ? used.filter((id) => id !== action.id) : [...used, action.id],
      }
    }

    // Clears all used Overdrive/Ultimate powers (Full Rest)
    case 'FULL_REST':
      return { ...state, usedPowerIds: [] }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// useCharacter — the public hook consumed by CharacterSheet and its children
// ---------------------------------------------------------------------------
export function useCharacter(initial: Character) {
  const [character, dispatch] = useReducer(reducer, initial)

  // Look up the class definition so we can pass the main attribute to computeDerivedStats.
  // Falls back to safe zeros if the class name doesn't match any known class.
  const classDef = CLASS_MAP[character.className]
  const derived: DerivedStats = useMemo(() => {
    return classDef
      ? computeDerivedStats(character, classDef)
      : { ar: 0, dr: 0, mr: 0, speed: 0, av: 0, maxHp: 0, maxRecuperations: 2, hl: 1 }
  }, [character, classDef])

  // Convenience wrapper so callers can do setCharacter(c) instead of dispatch({ type: 'SET_CHARACTER', ... })
  const setCharacter = useCallback(
    (c: Character) => dispatch({ type: 'SET_CHARACTER', payload: c }),
    []
  )

  return { character, derived, dispatch, setCharacter }
}
