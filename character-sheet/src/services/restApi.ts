import type { CharacterRepository } from './api'
import type { Character, CharacterSummary, CreateCharacterDto } from '../types/character'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const restApiRepository: CharacterRepository = {
  getAll(): Promise<CharacterSummary[]> {
    return request('/api/characters')
  },
  getById(id: string): Promise<Character> {
    return request(`/api/characters/${id}`)
  },
  create(dto: CreateCharacterDto): Promise<Character> {
    return request('/api/characters', { method: 'POST', body: JSON.stringify(dto) })
  },
  update(id: string, patch: Partial<Character>): Promise<Character> {
    return request(`/api/characters/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  },
  delete(id: string): Promise<void> {
    return request(`/api/characters/${id}`, { method: 'DELETE' })
  },
}
