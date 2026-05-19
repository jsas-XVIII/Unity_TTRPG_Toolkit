export function makeHomebrewStore<T extends { id: string }>(key: string) {
  let cache: T[] | null = null

  function invalidateCache(): void {
    cache = null
  }

  function getAll(): T[] {
    if (cache !== null) return cache
    try {
      cache = JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
    } catch {
      // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
      cache = []
    }
    return cache
  }

  // Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
  // Every write produces a fresh array reference (cache is replaced, never mutated in place),
  // so React state mirrors can rely on identity-based change detection.
  function save(items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items))
    cache = items
  }

  return {
    invalidateCache,
    getAll,
    replace: save,
    upsert(item: T): void {
      const existing = getAll()
      const idx = existing.findIndex((i) => i.id === item.id)
      save(idx >= 0 ? existing.map((i, n) => (n === idx ? item : i)) : [...existing, item])
    },
    remove(id: string): void {
      save(getAll().filter((i) => i.id !== id))
    },
  }
}
