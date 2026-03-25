import type { Character, CharacterSummary, CreateCharacterDto } from '../types/character'

export interface CharacterRepository {
  getAll(): Promise<CharacterSummary[]>
  getById(id: string): Promise<Character>
  create(character: CreateCharacterDto): Promise<Character>
  update(id: string, character: Partial<Character>): Promise<Character>
  delete(id: string): Promise<void>
}
