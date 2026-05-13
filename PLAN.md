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
Roll dice directly from the character sheet (attributes, skills, powers). Scope TBD — inline roll buttons, a roll log, or a dedicated roll modal.

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
