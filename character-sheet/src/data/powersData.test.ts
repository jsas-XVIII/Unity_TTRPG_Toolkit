// powersData.test.ts — unit tests for power data lookup and class path filtering.

import { describe, it, expect } from 'vitest'
import { getPowersByClass, getPowerById } from './powersData'

describe('getPowersByClass — Priest baseline powers', () => {
  const { baseline } = getPowersByClass('Priest')

  it('includes Healing Charge (shared by all Priests)', () => {
    expect(baseline.some((p) => p.id === 'healing-charge')).toBe(true)
  })

  it('includes Sacred Bolt restricted to chaplain', () => {
    const power = baseline.find((p) => p.id === 'sacred-bolt')
    expect(power).toBeDefined()
    expect(power?.restrictToClassPath).toBe('chaplain')
  })

  it('includes Holy Strike restricted to warpriest', () => {
    const power = baseline.find((p) => p.id === 'holy-strike')
    expect(power).toBeDefined()
    expect(power?.restrictToClassPath).toBe('warpriest')
  })

  it('healing-charge has no class path restriction', () => {
    const power = baseline.find((p) => p.id === 'healing-charge')
    expect(power?.restrictToClassPath).toBeUndefined()
  })
})

describe('getPowersByClass — baseline filtering by classPath', () => {
  const { baseline } = getPowersByClass('Priest')

  function forPath(classPath: string) {
    return baseline.filter((p) => !p.restrictToClassPath || p.restrictToClassPath === classPath)
  }

  it('Chaplain sees Sacred Bolt and Healing Charge, not Holy Strike', () => {
    const powers = forPath('chaplain')
    const ids = powers.map((p) => p.id)
    expect(ids).toContain('sacred-bolt')
    expect(ids).toContain('healing-charge')
    expect(ids).not.toContain('holy-strike')
  })

  it('War Priest sees Holy Strike and Healing Charge, not Sacred Bolt', () => {
    const powers = forPath('warpriest')
    const ids = powers.map((p) => p.id)
    expect(ids).toContain('holy-strike')
    expect(ids).toContain('healing-charge')
    expect(ids).not.toContain('sacred-bolt')
  })
})

describe('getPowerById — finds Priest baseline powers by id', () => {
  it('finds sacred-bolt', () => {
    const result = getPowerById('sacred-bolt')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Sacred Bolt')
    expect(result?.className).toBe('Priest')
  })

  it('finds holy-strike', () => {
    const result = getPowerById('holy-strike')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Holy Strike')
  })

  it('finds healing-charge', () => {
    const result = getPowerById('healing-charge')
    expect(result).toBeDefined()
    expect(result?.power.name).toBe('Healing Charge')
  })

  it('returns undefined for an unknown id', () => {
    expect(getPowerById('not-a-real-power')).toBeUndefined()
  })
})
