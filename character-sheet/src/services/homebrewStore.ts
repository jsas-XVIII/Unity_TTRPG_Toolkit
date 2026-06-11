export function makeHomebrewStore<T extends { id: string }>(key: string) {
  let cache: T[] | null = null

  function invalidateCache(): void {
    cache = null
  }

  // Saves the raw blob to a write-once backup key so corrupt data can be recovered.
  // Best-effort: never throws, never overwrites an existing backup.
  // [JSas | 2026-05-25] Added: corruption resilience — back up before discarding bad data
  function backupCorruptBlob(raw: string): void {
    try {
      const backupKey = `${key}__backup`
      if (localStorage.getItem(backupKey) === null) {
        localStorage.setItem(backupKey, raw)
      }
    } catch {
      // Intentionally swallowed — backup must never break a load.
    }
  }

  // Reads all items from localStorage; returns [] on null, non-JSON, or non-array values.
  // [JSas | 2026-05-25] Modified: added null-check, non-array guard, and backup-on-corrupt
  function getAll(): T[] {
    if (cache !== null) return cache
    const raw = localStorage.getItem(key)
    if (raw === null) {
      cache = []
      return cache
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      backupCorruptBlob(raw)
      cache = []
      return cache
    }
    if (!Array.isArray(parsed)) {
      backupCorruptBlob(raw)
      cache = []
      return cache
    }
    // Drop primitive or id-less entries that could accumulate from a failed migration
    // or a manually edited localStorage key. All store operations key on `item.id`,
    // so corrupt entries without a string id would cause silent downstream failures.
    cache = (parsed as unknown[]).filter(
      (item): item is T =>
        item !== null &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).id === 'string'
    )
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
