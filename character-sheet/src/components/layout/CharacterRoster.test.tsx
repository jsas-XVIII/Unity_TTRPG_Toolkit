// CharacterRoster.test.tsx — tests for the character selection screen.
//
// Covers the three render states (loading, empty, populated), user interactions,
// and the inline delete confirmation flow.
// The api prop is mocked so tests don't touch real localStorage.

import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CharacterRoster from './CharacterRoster'
import type { CharacterRepository } from '../../services/api'
import type { CharacterSummary } from '../../types/character'

expect.extend(matchers)

function mockApi(characters: CharacterSummary[] = []): CharacterRepository {
  return {
    getAll: vi.fn().mockResolvedValue(characters),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

const sampleCharacters: CharacterSummary[] = [
  { id: 'id-1', name: 'Aldric Voss', className: 'Dreadnought', race: 'Human', level: 3 },
  { id: 'id-2', name: 'Sera Nightwhisper', className: 'Phantom', race: 'Valla', level: 5 },
]

function renderRoster(
  characters: CharacterSummary[] = [],
  overrides?: { onSelect?: (id: string) => void; onBack?: () => void; api?: CharacterRepository }
) {
  const props = {
    api: overrides?.api ?? mockApi(characters),
    onSelect: overrides?.onSelect ?? vi.fn(),
    onBack: overrides?.onBack ?? vi.fn(),
  }
  render(<CharacterRoster {...props} />)
  return props
}

describe('CharacterRoster — loading state', () => {
  it('shows a loading indicator before getAll resolves', () => {
    const api: CharacterRepository = {
      getAll: vi.fn().mockReturnValue(new Promise(() => {})),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    }
    render(<CharacterRoster api={api} onSelect={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})

describe('CharacterRoster — empty state', () => {
  it('shows an empty state message after loading with no characters', async () => {
    renderRoster([])
    expect(await screen.findByText(/no characters saved yet/i)).toBeInTheDocument()
  })

  it('shows a prompt to create the first character', async () => {
    renderRoster([])
    expect(
      await screen.findByRole('button', { name: /create your first character/i })
    ).toBeInTheDocument()
  })

  it('calls onBack when "Create your first character" is clicked', async () => {
    const onBack = vi.fn()
    renderRoster([], { onBack })
    await userEvent.click(
      await screen.findByRole('button', { name: /create your first character/i })
    )
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('CharacterRoster — populated state', () => {
  it('renders a card for each saved character', async () => {
    renderRoster(sampleCharacters)
    expect(await screen.findByText('Aldric Voss')).toBeInTheDocument()
    expect(screen.getByText('Sera Nightwhisper')).toBeInTheDocument()
  })

  it('shows class, race, and level for each character', async () => {
    renderRoster(sampleCharacters)
    await screen.findByText('Aldric Voss')
    expect(screen.getByText(/dreadnought · human · level 3/i)).toBeInTheDocument()
    expect(screen.getByText(/phantom · valla · level 5/i)).toBeInTheDocument()
  })

  it('calls onSelect with the correct id when a character card is clicked', async () => {
    const onSelect = vi.fn()
    renderRoster(sampleCharacters, { onSelect })
    await userEvent.click(await screen.findByText('Aldric Voss'))
    expect(onSelect).toHaveBeenCalledWith('id-1')
  })

  it('does not show the empty state message when characters are present', async () => {
    renderRoster(sampleCharacters)
    await screen.findByText('Aldric Voss')
    expect(screen.queryByText(/no characters saved yet/i)).not.toBeInTheDocument()
  })

  it('renders a Delete button for each character', async () => {
    renderRoster(sampleCharacters)
    await screen.findByText('Aldric Voss')
    expect(screen.getByRole('button', { name: /delete aldric voss/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete sera nightwhisper/i })).toBeInTheDocument()
  })
})

describe('CharacterRoster — delete confirmation', () => {
  it('shows an inline confirmation when Delete is clicked', async () => {
    renderRoster(sampleCharacters)
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    expect(screen.getByText(/this cannot be undone/i)).toBeInTheDocument()
  })

  it('shows only the targeted character name in the confirmation', async () => {
    renderRoster(sampleCharacters)
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    // Confirmation text contains the character's name
    expect(screen.getByText(/aldric voss/i)).toBeInTheDocument()
    // The other character's card is unaffected
    expect(screen.getByText('Sera Nightwhisper')).toBeInTheDocument()
  })

  it('calls api.delete with the correct id when confirmed', async () => {
    const api = mockApi(sampleCharacters)
    renderRoster(sampleCharacters, { api })
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    // Click the confirm Delete button inside the confirmation row
    const confirmButtons = screen.getAllByRole('button', { name: /^delete$/i })
    await userEvent.click(confirmButtons[0])
    expect(api.delete).toHaveBeenCalledWith('id-1')
  })

  it('removes the character from the list after deletion', async () => {
    renderRoster(sampleCharacters)
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    const confirmButtons = screen.getAllByRole('button', { name: /^delete$/i })
    await userEvent.click(confirmButtons[0])
    expect(screen.queryByText('Aldric Voss')).not.toBeInTheDocument()
    // Other characters are unaffected
    expect(screen.getByText('Sera Nightwhisper')).toBeInTheDocument()
  })

  it('hides the confirmation and keeps the character when Cancel is clicked', async () => {
    renderRoster(sampleCharacters)
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    // Confirmation is gone
    expect(screen.queryByText(/this cannot be undone/i)).not.toBeInTheDocument()
    // Character is still in the list
    expect(screen.getByText('Aldric Voss')).toBeInTheDocument()
  })

  it('does not call api.delete when Cancel is clicked', async () => {
    const api = mockApi(sampleCharacters)
    renderRoster(sampleCharacters, { api })
    await userEvent.click(await screen.findByRole('button', { name: /delete aldric voss/i }))
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(api.delete).not.toHaveBeenCalled()
  })
})

describe('CharacterRoster — navigation', () => {
  it('renders the Back button', async () => {
    renderRoster()
    expect(await screen.findByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('calls onBack when the Back button is clicked', async () => {
    const onBack = vi.fn()
    renderRoster([], { onBack })
    await userEvent.click(await screen.findByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
