import type { ArtifactDefinition } from '../types/artifact'
import { makeHomebrewStore } from './homebrewStore'

const store = makeHomebrewStore<ArtifactDefinition>('unity_ttrpg_homebrew_artifacts')

export const invalidateArtifactsCache = store.invalidateCache
export const getHomebrewArtifacts = store.getAll
export const replaceHomebrewArtifacts = store.replace
export const upsertHomebrewArtifact = store.upsert
export const deleteHomebrewArtifact = store.remove
