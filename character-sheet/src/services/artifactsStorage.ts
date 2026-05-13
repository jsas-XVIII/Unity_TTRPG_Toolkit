import type { ArtifactDefinition } from '../types/artifact'

const KEY = 'unity_ttrpg_homebrew_artifacts'

let cache: ArtifactDefinition[] | null = null

export function invalidateArtifactsCache(): void {
  cache = null
}

export function getHomebrewArtifacts(): ArtifactDefinition[] {
  if (cache !== null) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ArtifactDefinition[]
  } catch {
    // localStorage value is corrupted (non-JSON); treat as empty rather than crashing.
    cache = []
  }
  return cache
}

// Throws QuotaExceededError if the browser storage limit is reached — callers must handle it.
// Every write produces a fresh array reference so React state mirrors can rely on identity checks.
function save(artifacts: ArtifactDefinition[]): void {
  localStorage.setItem(KEY, JSON.stringify(artifacts))
  cache = artifacts
}

export function replaceHomebrewArtifacts(artifacts: ArtifactDefinition[]): void {
  save(artifacts)
}

export function upsertHomebrewArtifact(artifact: ArtifactDefinition): void {
  const existing = getHomebrewArtifacts()
  const idx = existing.findIndex((a) => a.id === artifact.id)
  const next =
    idx >= 0 ? existing.map((a, i) => (i === idx ? artifact : a)) : [...existing, artifact]
  save(next)
}

export function deleteHomebrewArtifact(id: string): void {
  save(getHomebrewArtifacts().filter((a) => a.id !== id))
}
