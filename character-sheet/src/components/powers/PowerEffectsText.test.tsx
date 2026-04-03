// PowerEffectsText.test.tsx — unit tests for the effects text formatter.
//
// Covers:
//   1. Plain text passes through unchanged
//   2. Dice notation (1d6, 2d8+MIGHT) is rendered in an amber badge
//   3. Roll tables (2–8 = ×1, ...) are parsed into a grid with range labels and values
//   4. Mixed content: text + table + text all render in the right order
//   5. A single "N = value" expression (no comma) is NOT treated as a table

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import PowerEffectsText from './PowerEffectsText'

expect.extend(matchers)

function renderText(text: string) {
  return render(
    <PowerEffectsText text={text} accentClass="text-red-900" borderClass="border-red-900" />
  )
}

describe('PowerEffectsText — plain text', () => {
  it('renders text with no special patterns unchanged', () => {
    renderText('Deal damage to a single target.')
    expect(screen.getByText(/Deal damage to a single target\./)).toBeInTheDocument()
  })

  it('renders an empty string without error', () => {
    const { container } = renderText('')
    expect(container).toBeEmptyDOMElement()
  })
})

describe('PowerEffectsText — dice notation', () => {
  it('renders a dice expression in an amber badge', () => {
    renderText('Deal 1d6 damage.')
    const badge = screen.getByText('1d6')
    expect(badge.tagName).toBe('SPAN')
    expect(badge.className).toMatch(/bg-amber-100/)
    expect(badge.className).toMatch(/text-amber-800/)
  })

  it('renders compound dice notation like 2d8+MIGHT as a single badge', () => {
    renderText('Deal 2d8+MIGHT damage.')
    const badge = screen.getByText('2d8+MIGHT')
    expect(badge.className).toMatch(/bg-amber-100/)
  })

  it('renders compound dice notation with a numeric bonus like 1d4+1', () => {
    renderText('Deal 1d4+1 damage.')
    expect(screen.getByText('1d4+1')).toBeInTheDocument()
  })

  it('renders multiple dice expressions as separate badges', () => {
    renderText('Deal 1d4 or 2d6 damage.')
    expect(screen.getByText('1d4')).toBeInTheDocument()
    expect(screen.getByText('2d6')).toBeInTheDocument()
  })

  it('preserves surrounding text alongside dice badges', () => {
    renderText('Success: deal 1d6 damage.')
    expect(screen.getByText(/Success: deal/)).toBeInTheDocument()
    expect(screen.getByText('1d6')).toBeInTheDocument()
    expect(screen.getByText(/damage\./)).toBeInTheDocument()
  })
})

describe('PowerEffectsText — roll tables', () => {
  const TABLE_TEXT =
    'Roll to determine X: 2–8 = ×1, 9–15 = ×2, 16–21 = ×3, 22+ = ×4. Target gains +X AV.'

  it('renders each range label from the roll table', () => {
    renderText(TABLE_TEXT)
    expect(screen.getByText('2–8')).toBeInTheDocument()
    expect(screen.getByText('9–15')).toBeInTheDocument()
    expect(screen.getByText('16–21')).toBeInTheDocument()
    expect(screen.getByText('22+')).toBeInTheDocument()
  })

  it('renders each value from the roll table', () => {
    renderText(TABLE_TEXT)
    expect(screen.getByText('×1')).toBeInTheDocument()
    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(screen.getByText('×3')).toBeInTheDocument()
    expect(screen.getByText('×4')).toBeInTheDocument()
  })

  it('renders text before the table', () => {
    renderText(TABLE_TEXT)
    expect(screen.getByText(/Roll to determine X:/)).toBeInTheDocument()
  })

  it('renders text after the table without a leading period-space', () => {
    renderText(TABLE_TEXT)
    // Should start with "Target", not ". Target"
    expect(screen.getByText(/^Target gains \+X AV\./)).toBeInTheDocument()
  })

  it('renders negative modifier tables (e.g. −2, −3)', () => {
    renderText('Lower MR based on X: 2–8 = −2, 9–15 = −3, 16–21 = −4, 22+ = −5.')
    expect(screen.getByText('−2')).toBeInTheDocument()
    expect(screen.getByText('−5')).toBeInTheDocument()
  })

  it('does not treat a single "N = value" as a roll table', () => {
    renderText('X = 5, no table here.')
    // No range/value grid elements — just plain text
    expect(screen.getByText(/X = 5, no table here\./)).toBeInTheDocument()
  })
})
