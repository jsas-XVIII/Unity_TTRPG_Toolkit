# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

All commands run from the `character-sheet/` directory.

```bash
npm run dev          # dev server at http://localhost:5173
npm run build        # tsc type-check + production build
npm run lint         # ESLint
npm run typecheck    # type-check only (no emit)
npm run test:unit    # Vitest unit tests (non-interactive)
npm run cy:open      # open Cypress test runner (interactive)
npm run test:e2e     # start dev server + run Cypress headless
```

Run a single unit test file:
```bash
npx vitest run src/data/advancementData.test.ts
```

---

## Commit message format

Required by CI: `type(scope): description`

Allowed types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `style`, `perf`, `ci`

---

## Architecture

### Top-level layout

```
character-sheet/src/
  App.tsx           — root: owns view state ('home'|'roster'|'wizard'|'sheet') + import flow
  types/            — shared TypeScript interfaces (character.ts is the primary source of truth)
  constants/        — static class/race/armor/weapon/perk definitions (ClassDefinition, etc.)
  data/             — powers.json + powersData.ts, advancementData.ts (XP tables, level-up logic)
  hooks/            — useCharacter (reducer + derived stats), useApi (persistence abstraction)
  services/         — localStorage.ts implements CharacterRepository; api.ts defines the interface
  utils/            — derivedStats.ts (pure formulas), importCharacter.ts (migration + dedup)
  components/
    layout/         — HomeScreen, CharacterRoster, CharacterSheet (top-level sheet container)
    wizard/         — CharacterWizard + 8 Step* components + buildCharacter.ts
    powers/         — PowerCard, PowerList, PowerReferenceCard, PowerEffectsText
    advancement/    — level-up UI (AdvancementTable)
    equipment/      — weapons, armor, artifact editors
    identity/       — name, race, class, level display/edit
    paths/          — Core Paths stepper
    perks/          — perk picker
    resources/      — HP, class resource pips
    ui/             — reusable primitives (buttons, modals, etc.)
```

### State management

`useCharacter` (`hooks/useCharacter.ts`) is the central state hook for an open character sheet. It uses `useReducer` with a typed `Action` union. Components never mutate character data directly — they call `dispatch(action)`. `DerivedStats` (AR, DR, MR, Speed, AV, maxHp, etc.) are computed fresh every render via `computeDerivedStats` in `utils/derivedStats.ts`; they are never stored on `Character`.

### Power system

Powers are defined in `data/powers.json`, keyed by `ClassName`, then by pool (`baseline`, `tier1`, `tier2`, `lv3`, `lv8`, `lv10`). The `Character` object stores only `CharacterPower[]` — a list of `{ id, purchasedUpgradeIds, source? }` references. Full power data is resolved at render time via `getPowerById()` / `getPowersByClass()` in `data/powersData.ts`.

- **baseline / lv3 / lv8 / lv10** — fixed class feature powers, not user-selectable. Never appear in `character.powers`; upgrade selections live in `character.featureUpgrades` (a `Record<powerId, upgradeId[]>`).
- **tier1 / tier2** — user-selectable, token-budgeted. Stored in `character.powers`.
- `source: 'free_lv5'` on a `CharacterPower` marks a Tier II power granted for free at Level 5 (does not count against the token budget).

Token budgets by level are in `data/powersData.ts → TOKEN_BUDGET_BY_LEVEL`.

### Class definitions

All nine classes are defined in `constants/classes.ts` as `ClassDefinition[]`, exported as `CLASS_MAP` (keyed by `ClassName`). Each definition includes `mainAttribute`, `hpBase`, resource names/maxes, competencies, and optional `classPaths` (e.g. Priest has `chaplain` and `warpriest`). `ClassPathOption` can override `primaryResourceMax`, `primaryResourceRechargeDie`, and `secondaryResourceMax` for path-specific values.

### Persistence

`services/api.ts` defines the `CharacterRepository` interface (`getAll`, `getById`, `create`, `update`, `delete`). `services/localStorage.ts` implements it, storing all characters as a JSON array under `localStorage["unity_ttrpg_characters"]`. Every character passes through `migrateCharacter()` (in `utils/importCharacter.ts`) on load to handle schema migrations forward-compatibly.

`useApi()` returns the active repository. To add a new backend, implement `CharacterRepository` and swap the return in `hooks/useApi.ts` — no component code changes needed.

### Advancement / leveling

`data/advancementData.ts` contains:
- `ADVANCEMENT_ROWS` — per-level table of which bonuses apply (HP boost, token, AR/DR, etc.)
- `CLASS_AR_DR_PATTERN` — maps each class to `balanced | aggressive | glass-cannon`
- `applyLevelUp(character, classDef)` — applies all automatic bonuses and returns a `checklist` of manual choices to surface in the UI

### Game reference docs

Rules extracted from the Unity Core Rules PDF live in `docs/rules/`. The key files for implementation work are:
- `02_character_creation.md` — attributes, creation steps, perks, core paths
- `03_classes.md` — all 9 classes, token tables, class features
- `04_core_rules.md` — core mechanics
