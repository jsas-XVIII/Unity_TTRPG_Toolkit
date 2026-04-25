# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Workflow Conventions

### Testing & Linting Gate
After making code changes, always run tests AND lint together as a single gate before declaring work complete. Don't wait to be asked — treat lint as part of the test cycle.

### Before Implementing Options
When presenting multiple options (A/B/C), wait for explicit user selection and echo back which option you're implementing before writing code.

### Custom Commands
When creating new slash commands or modifying `.claude/` config, remind the user that Claude Code must be restarted for changes to take effect.

---

## Shell Environment

Windows/PowerShell environment. Do NOT use `&&` to chain commands — use `;` or separate commands.

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

### Cypress Test Conventions
For form inputs bound to state, use `data-testid` selectors with `.should('have.value', ...)` rather than `cy.contains()`, which only matches rendered text nodes.

---

## Commit message format

Required by CI: `type(scope): description`

Allowed types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`, `style`, `perf`, `ci`

---

## Architecture

### Top-level layout

```
character-sheet/src/
  App.tsx           — root: owns view state ('home'|'roster'|'wizard'|'sheet'|'gm') + import flow
  types/            — shared TypeScript interfaces (character.ts primary; monster.ts for GM tools)
  constants/        — static class/race/armor/weapon/perk definitions (ClassDefinition, etc.)
  data/             — powers.json + powersData.ts, advancementData.ts, monsters.json, monster-abilities.json, monstersData.ts
  hooks/            — useCharacter (reducer + derived stats), useApi (persistence abstraction)
  services/         — localStorage.ts (CharacterRepository), monsterStorage.ts (homebrew abilities)
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
    gm/             — GMDashboard; monsters/ (MonsterRoster, MonsterCard, MonsterForm)
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

### GM Tools — Monster System

**Data layer:**
- `types/monster.ts` — `Monster`, `MonsterAbility`, `MonsterAbilityKind` types
- `data/monsters.json` — built-in/official compendium monsters (currently 4 entries; more to be added)
- `data/monster-abilities.json` — flat ability library; monsters reference by `traitIds`/`powerIds` arrays
- `data/monstersData.ts` — `getAllMonsters`, `getMonsterById`, `getAllAbilities`, `resolveTraits`, `resolvePowers`, filter helpers
- `services/monsterStorage.ts` — homebrew ability persistence under `localStorage["unity_ttrpg_monsters_abilities"]`

**Components (`components/gm/monsters/`):**
- `MonsterRoster` — list with faction/type filters, sorted by DL; merges static compendium + homebrew
- `MonsterCard` — full stat block (header, stats grid, traits, powers, optional image)
- `MonsterForm` — create/edit form with DL-range validation

**DL range validation in MonsterForm:**
`DL_RANGES` (indexed by DL 1–10, sourced from Chapter VIII Monster Creation Table) stores `[min, max]` tuples per stat. Out-of-range fields get amber styling + a "suggested: X–Y" hint. Saving with out-of-range stats shows a confirmation step. "Apply baseline" fills all stats with DL minimums. The `dlColor()` helper uses if/else ranges (not numeric Record keys — ESLint naming-convention violation).

**Next up — Monster Creator:**
--Resume here--
1. Monster **template** system: a template is a named set of stat deltas and ability additions/removals that the GM applies to any monster on the fly during a combat encounter (e.g. "Enraged +5 HP, +1 DMG" or "Blessed +2 AR"). Templates are not persisted to a monster — they are a transient overlay.

### Game reference docs

Rules extracted from the Unity Core Rules PDF live in `docs/rules/`. Key files:
- `02_character_creation.md` — attributes, creation steps, perks, core paths
- `03_classes.md` — all 9 classes, token tables, class features
- `04_core_rules.md` — core mechanics
- `08_foes_fiends.md` — monster stat table by DL, encounter guidelines, ability rules
