import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
import AdvancementTable from './AdvancementTable'
import { CLASS_MAP } from '../../constants/classes'
import { baseCharacter } from '../../test/fixtures'

function renderTable(overrides?: Partial<typeof baseCharacter>) {
  const character = { ...baseCharacter, ...overrides }
  const classDef = CLASS_MAP[character.className]
  render(<AdvancementTable character={character} classDef={classDef} onLevelUp={vi.fn()} />)
}

describe('AdvancementTable — XP progress bar (#12)', () => {
  it('renders progress bar with 0% width when xp is below the previous threshold', () => {
    renderTable({ level: 3, xp: 0 })
    const bar = screen.getByTestId('xp-progress-bar')
    expect(bar).toHaveStyle({ width: '0%' })
  })

  it('renders progress bar with 0% when xp equals the previous threshold exactly', () => {
    renderTable({ level: 3, xp: 2000 })
    const bar = screen.getByTestId('xp-progress-bar')
    expect(bar).toHaveStyle({ width: '0%' })
  })

  it('renders progress bar near 100% when xp is just below the next threshold', () => {
    renderTable({ level: 3, xp: 3499 })
    const bar = screen.getByTestId('xp-progress-bar')
    const style = (bar as HTMLElement).style.width
    const pct = parseInt(style)
    expect(pct).toBeGreaterThan(90)
    expect(pct).toBeLessThanOrEqual(100)
  })

  it('clamps to 100% at max level (no next threshold)', () => {
    renderTable({ level: 10, xp: 50000 })
    expect(screen.queryByTestId('xp-progress-bar')).not.toBeInTheDocument()
  })
})
