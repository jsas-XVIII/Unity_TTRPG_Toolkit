// Workaround for GM panels that write directly to localStorage.
// React has no visibility into those mutations, so this hook provides:
//   [key]     — an incrementing number used as a useMemo dependency to
//               force re-reads from localStorage after a write
//   [refresh] — call after any localStorage write to invalidate the memos
// The long-term fix is HomebrewContext (see CLAUDE.md); this stays until then.
import { useState, useCallback } from 'react'

export function useDataRefresh(): [number, () => void] {
  const [key, setKey] = useState(0)
  const refresh = useCallback(() => setKey((n) => n + 1), [])
  return [key, refresh]
}
