import type { RollResult } from '../types/dice'

const MAX_HISTORY = 50

function storageKey(characterId: string): string {
  return `unity_ttrpg_roll_history_${characterId}`
}

export function getHistory(characterId: string): RollResult[] {
  try {
    const raw = localStorage.getItem(storageKey(characterId))
    return raw ? (JSON.parse(raw) as RollResult[]) : []
  } catch {
    return []
  }
}

export function pushResult(characterId: string, result: RollResult): RollResult[] {
  const history = [result, ...getHistory(characterId)].slice(0, MAX_HISTORY)
  try {
    localStorage.setItem(storageKey(characterId), JSON.stringify(history))
  } catch {
    // Quota exceeded — return the in-memory list without persisting
  }
  return history
}

export function clearHistory(characterId: string): void {
  localStorage.removeItem(storageKey(characterId))
}
