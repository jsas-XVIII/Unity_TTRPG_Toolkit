import { describe, it, expect, beforeEach } from 'vitest'
import { makeHomebrewStore } from './homebrewStore'

interface Item {
  id: string
  name: string
}

const KEY = 'test__homebrew_store'
const BACKUP_KEY = `${KEY}__backup`
const makeItem = (id: string, name = `Item ${id}`): Item => ({ id, name })

let store: ReturnType<typeof makeHomebrewStore<Item>>

beforeEach(() => {
  localStorage.clear()
  store = makeHomebrewStore<Item>(KEY)
})

describe('makeHomebrewStore — corrupt storage resilience', () => {
  it('returns [] and writes backup when blob is non-JSON', () => {
    localStorage.setItem(KEY, 'not-valid-json}}}')
    expect(store.getAll()).toEqual([])
    expect(localStorage.getItem(BACKUP_KEY)).toBe('not-valid-json}}}')
  })

  it('returns [] and writes backup when blob is valid JSON but not an array', () => {
    const blob = JSON.stringify({ not: 'an array' })
    localStorage.setItem(KEY, blob)
    expect(store.getAll()).toEqual([])
    expect(localStorage.getItem(BACKUP_KEY)).toBe(blob)
  })

  it('returns [] with no backup when storage is null (first run)', () => {
    // localStorage is clear from beforeEach
    expect(store.getAll()).toEqual([])
    expect(localStorage.getItem(BACKUP_KEY)).toBeNull()
  })

  it('backup is write-once — second corrupt load does not overwrite the first backup', () => {
    localStorage.setItem(KEY, 'first-corrupt')
    store.getAll()
    store.invalidateCache()
    localStorage.setItem(KEY, 'second-corrupt')
    store.getAll()
    expect(localStorage.getItem(BACKUP_KEY)).toBe('first-corrupt')
  })
})

describe('makeHomebrewStore — basic operations', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(store.getAll()).toEqual([])
  })

  it('upsert adds a new item', () => {
    store.upsert(makeItem('a1'))
    expect(store.getAll()).toHaveLength(1)
  })

  it('upsert replaces an existing item with the same id', () => {
    store.upsert(makeItem('a1'))
    store.upsert({ id: 'a1', name: 'Updated' })
    const all = store.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Updated')
  })

  it('remove deletes an item by id', () => {
    store.upsert(makeItem('a1'))
    store.remove('a1')
    expect(store.getAll()).toHaveLength(0)
  })

  it('replace overwrites all items', () => {
    store.upsert(makeItem('a1'))
    store.replace([makeItem('b1'), makeItem('b2')])
    const all = store.getAll()
    expect(all).toHaveLength(2)
    expect(all[0].id).toBe('b1')
  })
})
