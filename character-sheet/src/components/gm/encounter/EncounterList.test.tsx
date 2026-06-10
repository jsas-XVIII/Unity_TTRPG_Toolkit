import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EncounterList from './EncounterList'
import type { SavedEncounter } from '../../../types/encounter'

// Shambler (m-028) is a real compendium entry — used so the monster name summary
// resolves correctly against the static monstersData without needing mocks.
const SHAMBLER_ID = 'm-028'

const makeEncounter = (id: string, name = 'Ambush'): SavedEncounter => ({
  id,
  name,
  entries: [{ monsterId: SHAMBLER_ID, count: 2 }],
})

function renderList(encounters: SavedEncounter[] = []) {
  const handlers = {
    onBack: vi.fn(),
    onCreate: vi.fn(),
    onEdit: vi.fn(),
    onRun: vi.fn(),
    onDelete: vi.fn(),
  }
  render(<EncounterList encounters={encounters} {...handlers} />)
  return handlers
}

beforeEach(() => {
  localStorage.clear()
})

describe('EncounterList — empty state', () => {
  it('shows an empty-state message when there are no encounters', () => {
    renderList([])
    expect(screen.getByText(/no encounters saved yet/i)).toBeInTheDocument()
  })

  it('shows the New Encounter button', () => {
    renderList([])
    expect(screen.getByRole('button', { name: /\+ new encounter/i })).toBeInTheDocument()
  })
})

describe('EncounterList — with encounters', () => {
  it('renders the encounter name', () => {
    renderList([makeEncounter('e1', 'Forest Ambush')])
    expect(screen.getByText('Forest Ambush')).toBeInTheDocument()
  })

  it('shows monster name in the summary line', () => {
    renderList([makeEncounter('e1')])
    expect(screen.getByText(/shambler/i)).toBeInTheDocument()
  })

  it('shows the total monster count', () => {
    renderList([makeEncounter('e1')])
    expect(screen.getByText(/2 monsters/i)).toBeInTheDocument()
  })

  it('renders Run, Edit, and Delete buttons for each encounter', () => {
    renderList([makeEncounter('e1')])
    expect(screen.getByRole('button', { name: /^run$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
  })
})

describe('EncounterList — action handlers', () => {
  it('calls onRun with the encounter when Run is clicked', async () => {
    const enc = makeEncounter('e1', 'Cave Raid')
    const { onRun } = renderList([enc])
    await userEvent.click(screen.getByRole('button', { name: /^run$/i }))
    expect(onRun).toHaveBeenCalledWith(enc)
  })

  it('calls onEdit with the encounter when Edit is clicked', async () => {
    const enc = makeEncounter('e1', 'Cave Raid')
    const { onEdit } = renderList([enc])
    await userEvent.click(screen.getByRole('button', { name: /^edit$/i }))
    expect(onEdit).toHaveBeenCalledWith(enc)
  })

  it('calls onDelete with the encounter id when Delete is clicked', async () => {
    const enc = makeEncounter('e1')
    const { onDelete } = renderList([enc])
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(onDelete).toHaveBeenCalledWith('e1')
  })

  it('calls onCreate when New Encounter is clicked', async () => {
    const { onCreate } = renderList([])
    await userEvent.click(screen.getByRole('button', { name: /\+ new encounter/i }))
    expect(onCreate).toHaveBeenCalled()
  })

  it('calls onBack when Back is clicked', async () => {
    const { onBack } = renderList([])
    await userEvent.click(screen.getByRole('button', { name: /← back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})
