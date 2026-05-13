import artifactsJson from './artifacts.json'
import type { ArtifactDefinition } from '../types/artifact'

const OFFICIAL_ARTIFACTS: ArtifactDefinition[] = artifactsJson as ArtifactDefinition[]

export function getAllArtifacts(): ArtifactDefinition[] {
  return OFFICIAL_ARTIFACTS
}

export function getArtifactById(id: string): ArtifactDefinition | undefined {
  return OFFICIAL_ARTIFACTS.find((a) => a.id === id)
}

export function isOfficialArtifact(id: string): boolean {
  return OFFICIAL_ARTIFACTS.some((a) => a.id === id)
}

export function getArtifactsBySet(setId: string): ArtifactDefinition[] {
  return OFFICIAL_ARTIFACTS.filter((a) => a.setId === setId)
}
