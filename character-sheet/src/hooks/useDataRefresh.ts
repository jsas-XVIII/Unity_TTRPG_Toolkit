import { useState, useCallback } from 'react'

export function useDataRefresh(): () => void {
  const [, forceUpdate] = useState(0)
  return useCallback(() => forceUpdate((n) => n + 1), [])
}
