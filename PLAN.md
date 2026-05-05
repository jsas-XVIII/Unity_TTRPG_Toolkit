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

## Current State (2026-04-28)

Foundational features are mostly complete (character sheet, wizard, advancement, GM monster tool, GM powers/perks editor with View/Edit/readOnly). Remaining roadmap item is the player-side **Import Content Pack** card on `HomeScreen` (export side already shipped on the GM dashboard).

This document supersedes the previous roadmap. It captures an Opus-driven review of the codebase and a sequenced improvement plan covering performance, security, and bundle hygiene.

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

## Phase 0 — Investigation (resolved 2026-04-28)

| Question | Result |
|---|---|
| Is copyrighted material in git history? | No. PDF and `unity_rules.txt` were always gitignored. |
| Does `uuid ^13.0.0` resolve? | Yes (v13 and v14 exist). Pin is valid. |
| Is `docs/rules/` meant to be in-repo? | Yes — un-ignore and commit (single-developer project, useful from other devices). |
| Any `dangerouslySetInnerHTML` in `src/`? | None. React's default text-escaping is sufficient. Demotes import-validation from "security" to "storage hygiene." |
| Public-deploy copyright concern? | Acknowledged. Deploy is technically public via the Netlify URL but practically invisible. Revisit if scope changes (auth, broader sharing). |

---

## Improvement Phases

Each phase = one branch / PR. Branch names suggested. Sequencing favors low-risk wins first; phases 1, 2, 4 can run in parallel.

### ~~Phase 1 — Netlify security headers + CSP~~ ✓ done 2026-05-05

### ~~Phase 2 — Dep cleanup + `docs/rules/` un-ignore~~ ✓ done 2026-04-29

### ~~Phase 4 — localStorage quota handling~~ ✓ done 2026-04-29

### Phase 3 — Import validation (storage hygiene)
**Branch:** `feat/import-validation`
**Model:** Sonnet
**Risk:** Medium — touches the import surface. Existing tests in `useImportFlow.test.ts` and `contentPackService.test.ts` to extend.

Demoted from Phase 3 → after Phase 4 since the XSS angle is gone (no `dangerouslySetInnerHTML` anywhere). Still worth doing for storage hygiene and malformed-data resilience.

- Tighten `isValidCharacter` in `src/utils/importCharacter.ts:46`: validate every required field's type, validate enum values (`className`, `race`), strip unknown keys before persisting.
- Add `try/catch` around `JSON.parse` in `src/services/contentPackService.ts:36` and validate `version === 1`, `powers[]`, `perks[]` shapes before calling `replaceHomebrewPowers/Perks`.
- Add a confirmation prompt in the player-side import flow ("this will replace your homebrew library — continue?"). Belongs with the Import Content Pack card on `HomeScreen` if that ships first.

### Phase 5 — Bundle splitting + lazy GM data
**Branch:** `perf/bundle-split`
**Model:** Sonnet (Opus only if measurements get weird)
**Risk:** Medium — async data loading touches `getAllMonsters`/`getAbilityById` call sites. Likely needs small loading states in GM panels.

- In `vite.config.ts`, add `build.rollupOptions.output.manualChunks` to split React, react-hook-form, and uuid into a vendor chunk.
- Convert `monstersData.ts` to lazy-load `monsters.json`, `monster-abilities.json`, `monster-templates.json` via dynamic `import()`.
- Wrap `GMDashboard` in `React.lazy()` + `<Suspense>`.
- Measure before/after: `dist/assets/index-*.js` size. Target: initial chunk under 300 KB pre-gzip.

### Phase 6A — Lightweight homebrew/power lookup memoization
**Branch:** `perf/homebrew-cache`
**Model:** Sonnet
**Risk:** Low.

Bandaid for the perf hotspot before the proper HomebrewContext refactor (6B). `getPowersByClass` and `getPowerById` in `src/data/powersData.ts` re-read localStorage and re-parse 148 KB of JSON on every call. Same pattern in `monstersData.ts`.

- Add module-scope cache (`Map<id, Power>` + a flat resolved-pool cache) in `powersData.ts` and `monstersData.ts`.
- Invalidate the cache in `services/powersStorage.ts`/`perksStorage.ts`/`monsterStorage.ts` write functions (call an exposed `invalidatePowerCache()` / `invalidateMonsterCache()`).
- Keep the existing public API so call sites don't change.

### Phase 7 — Repo migration cache
**Branch:** `perf/repo-cache`
**Model:** Sonnet
**Risk:** Low–medium. Needs `storage` event handling for cross-tab sync.

`services/localStorage.ts` runs `migrateCharacter` on every character on every read. Every `update`/`delete`/`getById` call triggers a full re-migration of the entire roster.

- Add a module-scope cache of the migrated character array. `loadAll` returns the cache; writes update both cache and localStorage.
- Listen for `window.storage` events to invalidate the cache when other tabs write.
- Extend `localStorage.test.ts` with a cross-tab sync case.

### Phase 6B — HomebrewContext refactor
**Branch:** `refactor/homebrew-context` (dedicated, per CLAUDE.md)
**Model:** **Opus**
**Risk:** Medium. Touches every GM panel and their tests. Sequence after 6A and 7 land.

The proper architectural fix flagged in CLAUDE.md → "GM Tools — Planned: HomebrewContext Refactor". Replace direct localStorage writes + `useDataRefresh()` with React-aware state in a `HomebrewContext`. Migrate panels one at a time; the context and the localStorage services can coexist during the transition.

This is the one phase that meaningfully benefits from Opus: cross-cutting refactor, multiple call sites, judgment on context shape and migration order.

---

## Sequencing

```
Phase 0 (investigation)             ✓ done 2026-04-28
   ↓
Phase 1 (headers)        ─┐
Phase 2 (deps + rules)   ─┤  parallel-safe; can land in any order  ✓ all done 2026-05-05
Phase 4 (quota)          ─┘
   ↓
Phase 3 (import validation)
   ↓
Phase 5 (bundle split)
   ↓
Phase 6A (lightweight cache)
   ↓
Phase 7 (repo migration cache)
   ↓
Phase 6B (HomebrewContext)          dedicated branch, Opus session
```

Phases 1, 2, 4 don't touch overlapping files — pick whichever order fits. Phase 6A should land before Phase 7 to prove the cache-invalidation pattern on a smaller surface first.

---

## Model assignment summary

| Phase | Model |
|---|---|
| 1 — Netlify headers | Sonnet |
| 2 — Dep cleanup + un-ignore docs/rules | Sonnet |
| 3 — Import validation | Sonnet |
| 4 — Quota handling | Sonnet |
| 5 — Bundle split + lazy GM | Sonnet |
| 6A — Lightweight cache | Sonnet |
| 6B — HomebrewContext refactor | **Opus** |
| 7 — Repo migration cache | Sonnet |

Per the user's Sonnet-foundation / Opus-refinement workflow: most phases are well-scoped enough for Sonnet to land using this document as the brief. Reserve Opus for 6B and any phase where measurements or cross-file judgment calls demand deeper analysis.

---

## Open decisions

- **Sequencing vs. the in-flight Import Content Pack work** (next-task memory) — Phase 3 (import validation) should probably land *together with* the player-side Import Content Pack card on HomeScreen, since both touch the import surface. Decide at the time.
- **Phase 6A vs. 6B order** — current plan: 6A first as a perf bandaid, 6B later as the proper fix. Both will ship eventually.
- **Public-deploy copyright posture** — fine for now (private friend group). Revisit if the deploy ever gets shared more broadly.

---

## What this document is not

This is a planning document — not a status tracker, not a code reference. The repo state and CLAUDE.md are authoritative for "how things work today." When a phase ships, update CLAUDE.md if the architecture changed, and remove the phase from this file (or strike it through) so the remaining work stays prominent.
