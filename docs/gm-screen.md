# Plan: GM Screen + Ruin Tracker
Date: 2026-06-10
Branch: GM_Screen

## Effort Score
8

## Goal
Add a full-screen GM Session view with campaign management, session notes, Ruin tracking, a dice roller, and a shortcut to the Encounter Builder. Surface a Ruin widget inside the EncounterTracker so GMs can spend Ruin on monster powers mid-combat.

## Acceptance Criteria
- [ ] GM can create, select, and delete campaigns from the GM Screen; selection persists across page refresh and navigation
- [ ] GM can create, edit (title + content), and delete notes within a campaign; content persists across page refresh
- [ ] Ruin counter persists per-campaign; quick-add buttons (+1, +3 Respite, +7 Full Rest) and a custom Spend work correctly
- [ ] A Ruin widget appears in the EncounterTracker when a campaign is active and reads/writes the same campaign data
- [ ] Dice roller opens from the GM Screen and stores history separately from any character

## Phases

### Phase 1: Data Layer
- Files affected: `src/types/campaign.ts` (new), `src/services/campaignStorage.ts` (new)
- Changes: `CampaignNote { id, title, content }`, `Campaign { id, name, ruin, notes }` types; CRUD storage via `makeHomebrewStore<Campaign>('unity_ttrpg_campaigns')`; exports `getCampaigns`, `upsertCampaign`, `deleteCampaign`, `invalidateCampaignsCache`
- Success criteria: types compile, storage importable
- Tests: none (tested in Phase 4)

### Phase 2: RuinWidget + GMScreen
- Files affected: `src/components/gm/RuinWidget.tsx` (new), `src/components/gm/GMScreen.tsx` (new)
- Changes: RuinWidget — large Ruin display, +1/+3/+7 quick-add, Spend inline input. GMScreen — campaign selector, notes list + editor (blur-saves), RuinWidget, Encounter Builder link, Dice button (DiceTrayModal with `characterId='gm'` stub)
- Success criteria: components render and interact correctly in isolation
- Tests: none needed (logic-light UI; storage tested in Phase 4)

### Phase 3: Wiring
- Files affected: `src/components/gm/GMDashboard.tsx`, `src/components/gm/encounter/EncounterBuilder.tsx`, `src/components/gm/encounter/EncounterTracker.tsx`
- Changes: GMDashboard gets `'gmscreen'` view, `activeCampaignId` state (persisted to `unity_ttrpg_active_campaign_id`), GM Screen ToolCard, removal of disabled Ruin Tracker card; EncounterBuilder forwards `campaignId?`; EncounterTracker renders RuinWidget when campaignId provided
- Success criteria: end-to-end flow works; Ruin changes in tracker visible on return to GMScreen
- Tests: GMDashboard.test.tsx — add GM Screen card assertion

### Phase 4: Tests
- Files affected: `src/services/campaignStorage.test.ts` (new), `src/components/gm/GMDashboard.test.tsx` (update)
- Changes: campaignStorage tests mirror perksStorage pattern; GMDashboard gets GM Screen card test
- Success criteria: all 580+ tests pass, lint clean

## Hot Path Candidates
None — campaign data is small; `getCampaigns()` is cached by `makeHomebrewStore`.

## Flagged Concerns
- `DiceTrayModal` expects a full `Character` object; using a stub (`characterId='gm'`, zeroed attributes/derived) avoids modifying the component but shows quick-roll buttons as `2d10+0`. Acceptable per user intent.
- Notes save on blur only — mid-sentence crash loses unsaved text. Acceptable for personal-use tool.

## Out of Scope
- Player character sheet links in GM Screen
- Export/import GM notes
- Note rich text or markdown rendering
- Per-note timestamps or ordering controls
