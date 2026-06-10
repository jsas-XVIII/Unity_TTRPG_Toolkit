// derivedStats.test.ts — unit tests for computeDerivedStats.
//
// Covers all 8 stats returned by the function: HL, AR, DR, MR, Speed, AV,
// maxHp, and maxRecuperations. Each describe block tests one stat in isolation.
// Uses baseCharacter from fixtures as the base, overriding only the fields
// relevant to the stat under test so failures are unambiguous.

import { describe, it, expect } from 'vitest'
import { computeDerivedStats } from './derivedStats'
import { CLASS_MAP } from '../constants/classes'
import { baseCharacter } from '../test/fixtures'

// baseCharacter: Dreadnought lv1, might=3, agility=1, mind=1
// arBonus=0, drBonus=0, hpBonus=0, recuperationBonus=0, armor=[]

describe('HL — half-level, minimum 1', () => {
  it('level 1 → HL = 1 (clamped from floor(0))', () => {
    expect(computeDerivedStats({ ...baseCharacter, level: 1 }, CLASS_MAP['Dreadnought']).hl).toBe(1)
  })

  it('level 2 → HL = 1', () => {
    expect(computeDerivedStats({ ...baseCharacter, level: 2 }, CLASS_MAP['Dreadnought']).hl).toBe(1)
  })

  it('level 3 → HL = 1', () => {
    expect(computeDerivedStats({ ...baseCharacter, level: 3 }, CLASS_MAP['Dreadnought']).hl).toBe(1)
  })

  it('level 4 → HL = 2', () => {
    expect(computeDerivedStats({ ...baseCharacter, level: 4 }, CLASS_MAP['Dreadnought']).hl).toBe(2)
  })

  it('level 10 → HL = 5', () => {
    expect(computeDerivedStats({ ...baseCharacter, level: 10 }, CLASS_MAP['Dreadnought']).hl).toBe(
      5
    )
  })
})

describe('AR — class main attribute routing', () => {
  it('Dreadnought (might-based): AR = might + arBonus', () => {
    // might=3, arBonus=0 → AR=3
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).ar).toBe(3)
  })

  it('Fell Hunter (agility-based): AR = agility + arBonus', () => {
    // agility=1, arBonus=0 → AR=1
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Fell Hunter']).ar).toBe(1)
  })

  it('Mystic (mind-based): AR = mind + arBonus', () => {
    // mind=1, arBonus=0 → AR=1
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Mystic']).ar).toBe(1)
  })

  it('arBonus = 0 adds nothing', () => {
    expect(computeDerivedStats({ ...baseCharacter, arBonus: 0 }, CLASS_MAP['Dreadnought']).ar).toBe(
      3
    )
  })

  it('arBonus = 3 stacks on top of main attribute', () => {
    // might=3 + arBonus=3 → AR=6
    expect(computeDerivedStats({ ...baseCharacter, arBonus: 3 }, CLASS_MAP['Dreadnought']).ar).toBe(
      6
    )
  })
})

describe('DR — always agility + drBonus, class-independent', () => {
  it('DR = agility when drBonus = 0', () => {
    // agility=1 → DR=1
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).dr).toBe(1)
  })

  it('drBonus stacks on top of agility', () => {
    // agility=1 + drBonus=2 → DR=3
    expect(computeDerivedStats({ ...baseCharacter, drBonus: 2 }, CLASS_MAP['Dreadnought']).dr).toBe(
      3
    )
  })

  it('DR is the same for a mind-based class (Mystic) with the same agility', () => {
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Mystic']).dr).toBe(1)
  })
})

describe('MR — always mind, no modifier', () => {
  it('MR equals the mind attribute', () => {
    // mind=1 → MR=1
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).mr).toBe(1)
  })

  it('MR reflects an updated mind value', () => {
    const char = { ...baseCharacter, attributes: { ...baseCharacter.attributes, mind: 4 } }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).mr).toBe(4)
  })
})

describe('Speed — always agility, no modifier', () => {
  it('speed equals the agility attribute', () => {
    // agility=1 → speed=1
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).speed).toBe(1)
  })

  it('speed reflects an updated agility value', () => {
    const char = { ...baseCharacter, attributes: { ...baseCharacter.attributes, agility: 3 } }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).speed).toBe(3)
  })
})

describe('AV — sum of all equipped armor pieces', () => {
  it('empty armor array → AV = 0', () => {
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).av).toBe(0)
  })

  it('single armor piece → its av value', () => {
    const char = {
      ...baseCharacter,
      armor: [
        {
          id: 'a1',
          name: 'Leather',
          category: 'Light' as const,
          quality: 'Basic' as const,
          av: 2,
          cost: 10,
          notes: '',
        },
      ],
    }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).av).toBe(2)
  })

  it('multiple armor pieces → correct sum', () => {
    const char = {
      ...baseCharacter,
      armor: [
        {
          id: 'a1',
          name: 'Chainmail',
          category: 'Heavy' as const,
          quality: 'Basic' as const,
          av: 4,
          cost: 50,
          notes: '',
        },
        {
          id: 'a2',
          name: 'Shield',
          category: 'Shield' as const,
          quality: 'Basic' as const,
          av: 2,
          cost: 20,
          notes: '',
        },
      ],
    }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).av).toBe(6)
  })
})

describe('maxHp — hpBase + might + hpBonus', () => {
  it('Dreadnought (hpBase=14): maxHp = 14 + might + hpBonus', () => {
    // hpBase=14, might=3, hpBonus=0 → 17
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).maxHp).toBe(17)
  })

  it('Mystic (hpBase=8): lower hpBase is reflected in maxHp', () => {
    // hpBase=8, might=3, hpBonus=0 → 11
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Mystic']).maxHp).toBe(11)
  })

  it('hpBonus from leveling stacks on top of base + might', () => {
    // hpBase=14, might=3, hpBonus=9 → 26
    expect(
      computeDerivedStats({ ...baseCharacter, hpBonus: 9 }, CLASS_MAP['Dreadnought']).maxHp
    ).toBe(26)
  })
})

describe('maxRecuperations — 2 + floor(might/2) + recuperationBonus', () => {
  it('might = 1 → 2 recuperations (floor(0.5) = 0)', () => {
    const char = { ...baseCharacter, attributes: { ...baseCharacter.attributes, might: 1 } }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).maxRecuperations).toBe(2)
  })

  it('might = 3 → 3 recuperations (floor(1.5) = 1)', () => {
    // baseCharacter has might=3
    expect(computeDerivedStats(baseCharacter, CLASS_MAP['Dreadnought']).maxRecuperations).toBe(3)
  })

  it('might = 5 → 4 recuperations (floor(2.5) = 2)', () => {
    const char = { ...baseCharacter, attributes: { ...baseCharacter.attributes, might: 5 } }
    expect(computeDerivedStats(char, CLASS_MAP['Dreadnought']).maxRecuperations).toBe(4)
  })

  it('recuperationBonus stacks on top of base + floor(might/2)', () => {
    // might=3 → base 3, recuperationBonus=2 → 5
    expect(
      computeDerivedStats({ ...baseCharacter, recuperationBonus: 2 }, CLASS_MAP['Dreadnought'])
        .maxRecuperations
    ).toBe(5)
  })
})
