import { useState, useCallback } from 'react'

export function useDataRefresh(): [number, () => void] {
  const [key, setKey] = useState(0)
  const refresh = useCallback(() => setKey((n) => n + 1), [])
  return [key, refresh]
}
