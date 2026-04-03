// PowerEffectsText — renders power effect text with visual formatting for:
//   • Roll tables  e.g. "2–8 = ×1, 9–15 = ×2, 16–21 = ×3, 22+ = ×4"  → mini grid
//   • Dice notation  e.g. "1d6", "2d8+MIGHT"  → amber badge

interface Props {
  text: string
  accentClass: string // class-specific color, e.g. 'text-red-900'
  borderClass: string // class-specific border, e.g. 'border-red-900'
}

// A run of 2+ roll-table entries: "2–8 = ×1, 9–15 = ×2, ..." (en-dash or hyphen)
// Hyphen placed at start of character class to avoid needing an escape
const TABLE_RE = /(?:\d+[-–]\d+|\d+\+)\s*=\s*[^,.\n]+(?:,\s*(?:\d+[-–]\d+|\d+\+)\s*=\s*[^,.\n]+)+/g

// Dice notation: 1d4, 2d8, 1d4+MIGHT, 2d8+1
const DICE_RE = /\d+d\d+(?:[+-](?:[A-Z]+|\d+))*/g

type Segment =
  | { type: 'text'; content: string }
  | { type: 'table'; entries: Array<{ range: string; value: string }> }

function parseTable(raw: string): Array<{ range: string; value: string }> {
  const entries: Array<{ range: string; value: string }> = []
  const re = /(\d+[-–]\d+|\d+\+)\s*=\s*([^,]+)/g
  let m
  while ((m = re.exec(raw)) !== null) {
    entries.push({ range: m[1].trim(), value: m[2].trim() })
  }
  return entries
}

function segmentText(text: string): Segment[] {
  const segments: Segment[] = []
  TABLE_RE.lastIndex = 0
  let last = 0
  let match

  while ((match = TABLE_RE.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', content: text.slice(last, match.index) })
    }
    segments.push({ type: 'table', entries: parseTable(match[0]) })
    last = TABLE_RE.lastIndex
    // The table regex stops before a period, so skip a trailing ". " that
    // would otherwise appear as the first character of the next text segment.
    if (text[last] === '.' && text[last + 1] === ' ') last += 2
    else if (text[last] === '.') last += 1
  }

  if (last < text.length) {
    segments.push({ type: 'text', content: text.slice(last) })
  }

  return segments
}

function renderTextWithDice(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  DICE_RE.lastIndex = 0
  let last = 0
  let match
  let key = 0

  while ((match = DICE_RE.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    parts.push(
      <span
        key={key++}
        className="inline-block bg-amber-100 text-amber-800 font-mono font-bold text-[10px] px-1 py-0.5 rounded leading-none mx-0.5"
      >
        {match[0]}
      </span>
    )
    last = DICE_RE.lastIndex
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts
}

export default function PowerEffectsText({ text, accentClass, borderClass }: Props) {
  const segments = segmentText(text)

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{renderTextWithDice(seg.content)}</span>
        }

        const cols = seg.entries.length
        return (
          <span key={i} className="block my-1.5">
            <span
              className="grid gap-px text-center"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {seg.entries.map((e) => (
                <span
                  key={e.range}
                  className={`border-r last:border-r-0 ${borderClass} border-opacity-20`}
                >
                  <span className="block text-[9px] text-gray-400 leading-tight">{e.range}</span>
                  <span className={`block text-[12px] font-extrabold leading-tight ${accentClass}`}>
                    {e.value}
                  </span>
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </>
  )
}
