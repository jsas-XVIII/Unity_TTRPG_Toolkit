import { localStorageRepository } from '../services/localStorage'
import { restApiRepository } from '../services/restApi'
import type { CharacterRepository } from '../services/api'

export function useApi(): CharacterRepository {
  return import.meta.env.VITE_USE_API === 'true' ? restApiRepository : localStorageRepository
}
