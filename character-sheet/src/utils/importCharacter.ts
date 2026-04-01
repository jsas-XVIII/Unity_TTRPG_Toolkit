// importCharacter.ts — reads an imported JSON file and checks whether the
// character already exists in storage.
//
// Returns a discriminated union so the caller decides what to do:
//   { status: 'new',       parsed }  — id not found, safe to create
//   { status: 'duplicate', parsed }  — id already exists, ask the user
//
// Extracted as a standalone utility so it can be tested independently of the
// React component tree.

import type { Character } from '../types/character'
import type { CharacterRepository } from '../services/api'

export type ImportCheckResult =
  | { status: 'new'; parsed: Character }
  | { status: 'duplicate'; parsed: Character }

// Wraps FileReader in a Promise so the async/await flow stays clean.
// file.text() is not supported in jsdom (the test environment).
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function checkImport(
  file: File,
  api: CharacterRepository
): Promise<ImportCheckResult> {
  const text = await readFileAsText(file)
  const parsed = JSON.parse(text) as Character

  try {
    await api.getById(parsed.id)
    // getById resolved — this id is already in storage
    return { status: 'duplicate', parsed }
  } catch {
    // getById threw — character not found, safe to create
    return { status: 'new', parsed }
  }
}
