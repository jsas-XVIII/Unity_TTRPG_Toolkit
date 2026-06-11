import { describe, it, expect } from 'vitest'
import { baseCharacter } from '../test/fixtures'

// Import the reducer directly for unit testing without React overhead.
// The reducer is not exported, so we test it via the action dispatch contract
// by calling a thin wrapper that mirrors the reducer logic.
// Because the reducer is a pure function inside useCharacter.ts, we extract
// the behavior we need to verify at the SET_HP boundary.

// Rather than trying to export the private reducer, we test the clamping
// invariant by verifying the dispatch interface through renderHook.
import { renderHook, act } from '@testing-library/react'
import { useCharacter } from './useCharacter'

describe('useCharacter — SET_HP clamping (#7)', () => {
  it('clamps currentHp to 0 when dispatched value is negative', () => {
    const { result } = renderHook(() => useCharacter({ ...baseCharacter, currentHp: 0 }))
    act(() => {
      result.current.dispatch({ type: 'SET_HP', value: -1 })
    })
    expect(result.current.character.currentHp).toBe(0)
  })

  it('clamps currentHp to 0 when dispatched value is a large negative number', () => {
    const { result } = renderHook(() => useCharacter({ ...baseCharacter, currentHp: 5 }))
    act(() => {
      result.current.dispatch({ type: 'SET_HP', value: -100 })
    })
    expect(result.current.character.currentHp).toBe(0)
  })

  it('sets currentHp to a positive value normally', () => {
    const { result } = renderHook(() => useCharacter(baseCharacter))
    act(() => {
      result.current.dispatch({ type: 'SET_HP', value: 10 })
    })
    expect(result.current.character.currentHp).toBe(10)
  })

  it('sets currentHp to 0 when dispatched value is exactly 0', () => {
    const { result } = renderHook(() => useCharacter({ ...baseCharacter, currentHp: 5 }))
    act(() => {
      result.current.dispatch({ type: 'SET_HP', value: 0 })
    })
    expect(result.current.character.currentHp).toBe(0)
  })
})
