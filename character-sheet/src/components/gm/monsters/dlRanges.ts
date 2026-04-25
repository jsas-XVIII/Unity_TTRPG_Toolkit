export type StatRange = [number, number]

export interface DLRange {
  hp: StatRange
  ar: StatRange
  dr: StatRange
  mr: StatRange
  av: StatRange
  spd: StatRange
  xp: StatRange
}

export type RangeKey = keyof DLRange

// Monster Creation Table (Chapter VIII). Index = DL; index 0 unused.
export const DL_RANGES: (DLRange | null)[] = [
  null,
  {
    hp: [10, 19],
    ar: [11, 13],
    dr: [13, 16],
    mr: [11, 14],
    av: [0, 1],
    spd: [11, 13],
    xp: [10, 20],
  },
  {
    hp: [14, 22],
    ar: [11, 13],
    dr: [14, 16],
    mr: [12, 14],
    av: [0, 2],
    spd: [11, 13],
    xp: [20, 40],
  },
  {
    hp: [16, 25],
    ar: [12, 15],
    dr: [15, 17],
    mr: [13, 15],
    av: [0, 2],
    spd: [12, 15],
    xp: [40, 60],
  },
  {
    hp: [20, 30],
    ar: [12, 16],
    dr: [16, 18],
    mr: [14, 16],
    av: [0, 3],
    spd: [12, 16],
    xp: [60, 100],
  },
  {
    hp: [28, 40],
    ar: [13, 16],
    dr: [17, 20],
    mr: [15, 18],
    av: [0, 3],
    spd: [13, 16],
    xp: [100, 150],
  },
  {
    hp: [40, 60],
    ar: [13, 16],
    dr: [18, 21],
    mr: [16, 19],
    av: [0, 4],
    spd: [13, 16],
    xp: [150, 200],
  },
  {
    hp: [50, 70],
    ar: [14, 17],
    dr: [19, 22],
    mr: [17, 20],
    av: [0, 4],
    spd: [14, 17],
    xp: [200, 250],
  },
  {
    hp: [57, 78],
    ar: [14, 18],
    dr: [19, 22],
    mr: [17, 20],
    av: [0, 5],
    spd: [14, 18],
    xp: [250, 300],
  },
  {
    hp: [63, 83],
    ar: [15, 18],
    dr: [21, 23],
    mr: [19, 21],
    av: [0, 5],
    spd: [15, 18],
    xp: [300, 350],
  },
  {
    hp: [65, 85],
    ar: [15, 20],
    dr: [22, 25],
    mr: [20, 23],
    av: [0, 6],
    spd: [15, 20],
    xp: [350, 400],
  },
]

export function getRangeForDL(dl: number): DLRange | null {
  const idx = Math.min(Math.max(Math.round(dl), 1), 10)
  return DL_RANGES[idx] ?? null
}

export function getOutOfRange(dl: number, stats: Record<RangeKey, number>): Set<RangeKey> {
  const range = getRangeForDL(dl)
  if (!range) return new Set()
  const out = new Set<RangeKey>()
  for (const key of Object.keys(range) as RangeKey[]) {
    const [min, max] = range[key]
    if (stats[key] < min || stats[key] > max) out.add(key)
  }
  return out
}
