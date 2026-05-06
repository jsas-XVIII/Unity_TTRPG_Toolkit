// Manages the two-step character import flow used in both entry points:
//   fromHome=true  (HomeScreen)  → on success, navigate directly to the sheet
//   fromHome=false (CharacterSheet) → on success, show ImportConfirmModal first
//
// Two modal states are surfaced to the caller:
//   duplicateImport  — a file whose ID already exists in storage (shows DuplicateCharacterModal)
//   importedCharacter — a successfully created character awaiting confirmation (shows ImportConfirmModal)
//
// onLoadCharacter is called when the import is fully resolved and ready to open.
// onError is called on any unhandled exception (caller sets the save-status banner).
import { useState } from 'react'
import type { Character } from '../types/character'
import type { CharacterRepository } from '../services/api'
import { checkImport } from '../utils/importCharacter'

export function useImportFlow(
  api: CharacterRepository,
  onLoadCharacter: (char: Character) => void,
  onError: () => void
) {
  // Held while ImportConfirmModal is open (sheet-side import path only)
  const [importedCharacter, setImportedCharacter] = useState<Character | null>(null)
  // Held while DuplicateCharacterModal is open; fromHome preserved for the correct post-resolve path
  const [duplicateImport, setDuplicateImport] = useState<{
    parsed: Character
    fromHome: boolean
  } | null>(null)
  // Set when the selected file is not a valid character JSON
  const [importError, setImportError] = useState<string | null>(null)

  // Core handler — shared by both entry points via handleImport / handleImportDirect
  async function handleFileSelected(file: File, fromHome: boolean) {
    try {
      const result = await checkImport(file, api)
      if (result.status === 'invalid') {
        setImportError("Invalid file — this doesn't look like a character.")
        return
      }
      if (result.status === 'duplicate') {
        setDuplicateImport({ parsed: result.parsed, fromHome })
        return
      }
      const created = await api.create(result.parsed)
      if (fromHome) {
        onLoadCharacter(created)
      } else {
        setImportedCharacter(created)
      }
    } catch {
      onError()
    }
  }

  function clearImportError() {
    setImportError(null)
  }

  // Entry point: CharacterSheet "Import JSON" button
  function handleImport(file: File) {
    handleFileSelected(file, false)
  }

  // Entry point: HomeScreen "Import Character" button
  function handleImportDirect(file: File) {
    handleFileSelected(file, true)
  }

  // DuplicateCharacterModal: user chose to save a copy with a new ID
  async function handleDuplicateConfirm() {
    if (!duplicateImport) return
    const { parsed, fromHome } = duplicateImport
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = parsed
      const copy = await api.create({ ...rest, name: `${parsed.name} - copy` })
      setDuplicateImport(null)
      if (fromHome) {
        onLoadCharacter(copy)
      } else {
        setImportedCharacter(copy)
      }
    } catch {
      onError()
    }
  }

  // DuplicateCharacterModal: user cancelled — discard the import
  function handleDuplicateDismiss() {
    setDuplicateImport(null)
  }

  // ImportConfirmModal: user confirmed — switch to the imported character
  function handleImportConfirm() {
    if (!importedCharacter) return
    onLoadCharacter(importedCharacter)
    setImportedCharacter(null)
  }

  // ImportConfirmModal: user dismissed — stay on the current sheet
  function handleImportDismiss() {
    setImportedCharacter(null)
  }

  return {
    importedCharacter,
    duplicateImport,
    importError,
    clearImportError,
    handleImport,
    handleImportDirect,
    handleDuplicateConfirm,
    handleDuplicateDismiss,
    handleImportConfirm,
    handleImportDismiss,
  }
}
