import { describe, it, expect, beforeEach } from 'vitest'
import { makeHomebrewStore } from './homebrewStore'

interface Item {
  id: string
  name: string
}

const KEY = 'unity_test_homebrew_store'

function makeStore() {
  return makeHomebrewStore<Item>(KEY)
}

beforeEach(() => {
  localStorage.clear()
})

describe('homebrewStore — getAll invalid-entry filtering (#11)', () => {
  it('returns [] when the stored value is a primitive (number)', () => {
    localStorage.setItem(KEY, '42')
    expect(makeStore().getAll()).toEqual([])
  })

  it('silently drops primitive elements within an array', () => {
    localStorage.setItem(KEY, JSON.stringify([1, 'string', true]))
    expect(makeStore().getAll()).toEqual([])
  })

  it('silently drops null elements within an array', () => {
    localStorage.setItem(KEY, JSON.stringify([null, null]))
    expect(makeStore().getAll()).toEqual([])
  })

  it('silently drops objects that are missing an id field', () => {
    localStorage.setItem(KEY, JSON.stringify([{ name: 'no-id' }]))
    expect(makeStore().getAll()).toEqual([])
  })

  it('silently drops objects with a non-string id', () => {
    localStorage.setItem(KEY, JSON.stringify([{ id: 123, name: 'numeric-id' }]))
    expect(makeStore().getAll()).toEqual([])
  })

  it('returns valid entries and drops invalid ones from the same array', () => {
    const valid: Item = { id: 'item-1', name: 'Valid' }
    localStorage.setItem(KEY, JSON.stringify([valid, null, 42, { name: 'no-id' }]))
    expect(makeStore().getAll()).toEqual([valid])
  })

  it('returns all entries unchanged when every element is valid', () => {
    const items: Item[] = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]
    localStorage.setItem(KEY, JSON.stringify(items))
    expect(makeStore().getAll()).toEqual(items)
  })
})
