import artifactsJson from './artifacts.json'
import type { ArtifactDefinition } from '../types/artifact'
import { getHomebrewArtifacts } from '../services/artifactsStorage'
import { getOfficialArtifacts as getOfficialArtifactsFromStorage } from '../services/officialContentStorage'
import { mergeOfficial } from '../utils/mergeOfficial'

const OFFICIAL_ARTIFACTS: ArtifactDefinition[] = artifactsJson as ArtifactDefinition[]

export function getAllArtifacts(): ArtifactDefinition[] {
  const withOfficial = mergeOfficial(OFFICIAL_ARTIFACTS, getOfficialArtifactsFromStorage() ?? [])
  return mergeOfficial(withOfficial, getHomebrewArtifacts())
}

export function getOfficialArtifacts(): ArtifactDefinition[] {
  return OFFICIAL_ARTIFACTS
}

export function getArtifactById(id: string): ArtifactDefinition | undefined {
  return getAllArtifacts().find((a) => a.id === id)
}

export function isOfficialArtifact(id: string): boolean {
  return OFFICIAL_ARTIFACTS.some((a) => a.id === id)
}

export function getArtifactsBySet(setId: string): ArtifactDefinition[] {
  return getAllArtifacts().filter((a) => a.setId === setId)
}
