import { v4 as uuidv4 } from 'uuid'
import type { CharacterRepository } from './api'
import type { Character, CharacterSummary, CreateCharacterDto } from '../types/character'

const STORAGE_KEY = 'unity_ttrpg_characters'

function loadAll(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Character[]) : []
  } catch {
    return []
  }
}

function saveAll(characters: Character[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

export const localStorageRepository: CharacterRepository = {
  async getAll(): Promise<CharacterSummary[]> {
    return loadAll().map(({ id, name, className, race, level }) => ({
      id,
      name,
      className,
      race,
      level,
    }))
  },

  async getById(id: string): Promise<Character> {
    const found = loadAll().find((c) => c.id === id)
    if (!found) throw new Error(`Character ${id} not found`)
    return found
  },

  async create(dto: CreateCharacterDto): Promise<Character> {
    const characters = loadAll()
    const character: Character = { ...dto, id: uuidv4() }
    characters.push(character)
    saveAll(characters)
    return character
  },

  async update(id: string, patch: Partial<Character>): Promise<Character> {
    const characters = loadAll()
    const index = characters.findIndex((c) => c.id === id)
    if (index === -1) throw new Error(`Character ${id} not found`)
    characters[index] = { ...characters[index], ...patch }
    saveAll(characters)
    return characters[index]
  },

  async delete(id: string): Promise<void> {
    const characters = loadAll().filter((c) => c.id !== id)
    saveAll(characters)
  },
}
