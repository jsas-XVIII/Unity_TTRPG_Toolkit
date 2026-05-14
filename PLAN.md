# Unity TTRPG Toolkit — Improvement Plan

## Project Goal
A toolkit for the Unity Tabletop RPG (Zensara Studios / Modiphius Entertainment) featuring:
- Interactive digital character sheets
- Game Master tools (powers/perks editor, monster creation, encounter management)
- Eventually: character data persisted to SQLite via a C# REST API (deferred)

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + Vite + TypeScript | |
| Styling | Tailwind CSS v4 | |
| Form state | React Hook Form | |
| Persistence | `localStorage` + JSON files in repo | Characters in localStorage; game content (powers, monsters, perks) in `src/data/*.json` |
| Hosting | Netlify (`netlify.toml`) | Public deploy of a private GitLab repo |
| Backend (deferred) | C# ASP.NET Core + SQLite | Only if multi-device sync becomes a real need |

---

## Architecture Decisions (still in force)

### Game Reference Data — JSON files (not SQLite)
Static rulebook content (`powers.json`, `perks.json`, `monsters.json`, `monster-abilities.json`, `monster-templates.json`) lives in `src/data/`. Homebrew lives in localStorage and is layered on top via the merge helpers in `data/powersData.ts`, `data/perksData.ts`, `data/monstersData.ts`. See CLAUDE.md → "GM Tools — Content Layering Model" for the full model.

### Per-Instance Multi-Group Isolation
Each GM forks the repo and runs their own Netlify deploy. Multi-tenancy on a single hosted app is out of scope.

### GM Authoring — In-App
The GM creates homebrew content via the in-app GM panels. Content packs are exported as a single JSON file the GM shares with players, who import it into their browsers. No git knowledge required.

### REST API Contract (deferred backend)
`services/api.ts` defines `CharacterRepository`. `useApi()` swaps implementations based on `VITE_USE_API`. When the C# backend is built, only `services/restApi.ts` needs to be added — no component changes.

---

## Done

- ~~Phase 1 — Netlify security headers + CSP~~ ✓ 2026-05-05
- ~~Phase 2 — Dep cleanup + un-ignore `docs/rules/`~~ ✓ 2026-04-29
- ~~Phase 4 — localStorage quota handling~~ ✓ 2026-04-29
- ~~Phase 6A — Lightweight homebrew/power lookup memoization~~ ✓ 2026-05-05
- ~~Phase 7 — Repo migration cache~~ ✓ 2026-05-05
- ~~Phase 6B — HomebrewContext refactor~~ ✓ 2026-05-05

---

## Remaining

- ~~Phase 3 — Import-pack resilience~~ ✓ 2026-05-06

---

## Upcoming Features

### Dice Rolling — Character Sheet

**Entry point:** A button in the character sheet header opens a **Dice Tray modal** with two tabs.

**Roll tab**
- Three quick-roll buttons: **Attack** (`2d10 + AR`), **Defense** (`2d10 + DR`), **Mind Resist** (`2d10 + MR`). Fire immediately using derived stats; respect the current Benefit/Hindrance toggle state.
- **Custom roll form:**
  | Field | Options | Condition |
  |---|---|---|
  | Dice | 2d10, d4, d6, d8, d10, d12, 2d6 | Always |
  | Attribute | None, Might, Agility, Mind, Presence | Always |
  | Normal / Benefit / Hindrance | toggle | Only when dice = 2d10 |
  | Half Level | checkbox | Only when dice = 2d10 |
  | Misc bonus | +/- number field | Always |
- Optional **label field** (blank by default) — stored with the history entry if filled.
- **Result display** inside the modal: individual dice values visible, crit highlighted.

**Crit logic (2d10 rolls only):**
- Normal: both kept dice match → crit
- Benefit: roll 3d10, keep 2 highest — crit if any two of the three dice match (including the dropped die)
- Hindrance: roll 3d10, keep 2 lowest — crit impossible

**History tab**
- Last 50 rolls, newest first.
- Each entry shows: source/label, individual dice results, total.
- Persisted to **localStorage**, scoped per character. Survives page refresh.

**Roll20 Macro Export**
- The Roll tab has two independent actions on the same form state: **Roll** (rolls in the app and shows the result) and **Copy Roll20 Macro** (generates a macro string and copies it to the clipboard). Either can be used independently.
- Syntax mapping:
  - Normal: `/roll 2d10+5 [Attack Roll]`
  - Benefit: `/roll 3d10kh2+5 [Attack Roll]`
  - Hindrance: `/roll 3d10kl2+5 [Attack Roll]`
- The label field (if filled) is appended in brackets for Roll20 chat context.
- Damage/other dice follow the same pattern without the kh/kl modifier.

**Out of scope:** Inline roll buttons on the sheet, automatic power-expression parsing.

### Encounter Builder — GM Tools
GM tool to build and run encounters: select monsters from the roster, set quantities, track initiative and HP during a session.

### GM Screen
A GM-facing panel for session management: free-form notes, active encounter tracker, quick reference tables.

### Ruin Tracker
Track Ruin (the campaign's corruption/doom mechanic) at the party or per-character level. Design TBD — needs more thought on how the GM wants to surface and interact with it.

### Story Progression Bonuses — Homebrew
Allow the GM to define and distribute out-of-band bonuses tied to story events: bonus attributes, bonus perks, bonus Power Tokens, or other stat adjustments. These would be authored in the GM panel and included in the content pack so players receive them automatically on import.

---

## Deliberately not on this list

The following came up during prior reviews but were judged over-engineering for a single-user, localStorage-backed hobby app. Revisit only if scope changes.

- **Bundle splitting / lazy GM dashboard** — initial chunk is fine on a CDN; no measured pain.
- **Cross-tab storage event listener** — single-tab use; not worth the complexity.
- **HomebrewProvider unit tests** — panel tests already cover the chain.
- **Half-imported pack on quota mid-replace** — quota is unreachable at realistic scale.
- **Panel-test cache invalidation in `beforeEach`** — latent foot-trap with no test currently triggering it; defer until a test actually breaks.
