# MOB-1704 — ExploreV2 Saved Searches: implementation plan

## Context

ExploreV2 searches are ephemeral: `ExploreV2Context` lives inside the bottom-tab tree and is
lost on a tab switch, and only recent *subjects* and *places* persist. A user who checks the
same query regularly rebuilds it by hand, and the cost grows with every filter. This adds
device-local saved searches — save from the results screen, apply from either search surface —
per `docs/features/mob-1704/intent.md` and `docs/features/mob-1704/spec.md`, which are
committed and approved. The design is settled on the canvas linked in the spec.

No server work, no Realm migration, no new feature flag. Five stages, ordered so the risky
gesture work is isolated and droppable.

## Stage 1 — Data layer (no UI)

**New** `src/components/Explore/ExploreV2/helpers/savedSearchKey.ts`
Canonical identity per spec §3.2: `[subjectPart, locationPart, filtersPart].join("|")`, built
from named fields in a fixed order — never `JSON.stringify`. Reuses the existing `subjectKey`
export from `src/stores/createExploreV2RecentSearchesSlice.ts`. Sort is excluded.

**Rename** `src/stores/createExploreV2RecentSearchesSlice.ts` →
`src/stores/createExploreV2SearchesSlice.ts` (via `git mv`, so history follows), interface
`ExploreV2RecentSearchesSlice` → `ExploreV2SearchesSlice`. Saved searches live in this same
slice, reusing its `subjectKey` and the `addRecent` cap-and-dedupe helper rather than
duplicating either.

Inside it, add a **sibling namespace** `exploreSavedSearches: { searches, saveSearch,
removeSearch }` next to the existing `exploreRecentSearches`. `saveSearch` toggles — an
existing key is removed, a new one goes to the front — and is a no-op at `SAVED_LIMIT = 20`.
Never evicts (unlike recents, which evict at 10 — the right difference between something you
happened to search and something you chose to keep).

The `exploreRecentSearches` namespace name **does not change**: `partialize` writes it into
the persisted MMKV blob by that key, so renaming it would silently drop every existing user's
recents on upgrade. One slice, two namespaces, no migration.

**Edit** the four importers for the new module path and type name —
`components/RecentSearches.tsx`, `components/RecentLocations.tsx`,
`screens/UniversalSearch.tsx`, `stores/useStore.js` — and `git mv` the test file to
`tests/unit/stores/createExploreV2SearchesSlice.test.js`. The 24 call sites that reference the
`exploreRecentSearches` namespace itself are untouched.

**Edit** `src/stores/useStore.js` to add `exploreSavedSearches: { searches: … }` to
`partialize`. The store's `merge: (persisted, current) => merge(current, persisted)` is a
lodash deep merge; our default is `[]`, so the persisted array wins cleanly, same as recents.

**Tests** `tests/unit/components/Explore/ExploreV2/savedSearchKey.test.js`, plus saved-search
cases added to the renamed `tests/unit/stores/createExploreV2SearchesSlice.test.js` alongside
its existing recents coverage (it drives the real store via `useStore.getState()`).
Cover: identical searches match; a changed filter/place/subject does not; differing only in
sort *does* match; `MAP_AREA` bounds round consistently; no-subject and `unobserved` keys are
distinct and stable; toggle-off; ordering; the cap is a no-op.

## Stage 2 — Extract `subjectLabel`

**New** `src/components/Explore/ExploreV2/helpers/subjectLabel.ts` — moved verbatim out of
`ExploreV2Header.tsx`, where it is currently a non-exported local.
**Edit** `ExploreV2Header.tsx` to import it. Nothing else changes. Kept as its own step so the
move stays reviewable and doesn't hide inside a feature diff.

## Stage 3 — Save toggle on results

**New** `src/components/Explore/ExploreV2/components/SaveSearchButton.tsx`
`INatIconButton`, 46×46, `bg-white rounded-full border-[1px] border-lightGray absolute z-10
right-5`, `getShadow({ offsetHeight: 4, elevation: 6 })` — copied from
`src/components/SharedComponents/Buttons/SortButton.tsx`, which is the visual precedent.
Icons `star` / `star-bold-outline`; both already exist in `INatIcon/glyphmap.json`, so no font
regeneration and no native rebuild.

**Edit** `src/components/Explore/ExploreV2/screens/ExploreResults.tsx`
Render it as a sibling of `SortButton` inside `renderContent`, in every layout and on both
tabs. Vertical offset `bottom-[140px]` on the map layout (clearing the layers button at
`bottom-20` and current location at `bottom-5`), `bottom-[76px]` otherwise (clearing
`SortButton` at `bottom-5`). Saved state is derived from
`searches.some( s => s.key === savedSearchKey( state ) )`. At the cap, show the existing
`WarningSheet` instead of saving.

## Stage 4 — Rows and sections in Universal Search

**New** components under `src/components/Explore/ExploreV2/components/`:
- `SearchSectionHeader.tsx` — divider, 18px icon, `Body3` title, count, `px-[15px] py-[10px]`.
  Modelled on `SharedComponents/CollapsibleSectionHeader.tsx` but static: no caret, no
  `isOpen`/`onToggle`. Reusing that component would drag in collapse behavior we decided
  against.
- `SavedSearchRow.tsx` — three lines per spec §4.3. `DisplayTaxonName` for taxon subjects,
  otherwise `subjectLabel` in `Body1`; `locationLabel()` + `location` icon; `countFilters()` +
  `sliders` icon, omitted at zero. Thumbnail falls back to `IconicTaxonIcon` at
  `THUMBNAIL_CLASS` for no-subject and `unobserved`.
- `SavedSearches.tsx` — renders its own header and rows, and `null` when empty, exactly as
  `RecentSearches.tsx` already does.

**New** `src/components/Explore/ExploreV2/helpers/applySavedSearch.ts` — the single dispatch
sequence from spec §5, used by both surfaces so they cannot drift. No `SET_ACTIVE_TAB`, no
recents recorded.

**Edit** `RecentSearches.tsx` to render a `SearchSectionHeader` (clock icon) above its rows.
**Edit** `DefaultSearchOptions.tsx` to insert `<SavedSearches>` between the "Species I haven't
observed" row and `<RecentSearches>`.

**Tests** alongside `components/RecentSearches.test.js`: row renders all three lines, omits the
third at zero filters, uses the placeholder thumbnail; sections vanish when empty; tapping a
row applies — asserted on resulting context state, not on dispatch spies.

## Stage 5 — Swipe to delete

Wrap `SavedSearchRow` in `ReanimatedSwipeable` (`react-native-gesture-handler` ^2.30.0)
revealing a `warningRed` delete action with the `trash-outline` glyph.

**This is the only unprecedented piece — nothing in this repo uses `Swipeable` today.** It has
to survive `DefaultSearchOptions`' `ScrollView`, which is itself the `ListEmptyComponent` of a
`FlatList`, and later the gorhom sheet's own pan gesture. Kept last and standalone: if it
fights back on either platform, the fallback is the star as the only delete path, which is a
spec amendment to raise, not a silent drop.

## Stage 6 — Advanced Search

**Edit** `src/components/Explore/ExploreV2/screens/AdvancedSearch.tsx`
A `SAVED SEARCHES` section above `TAXON`: `Heading4` plus a standard outlined `Button` reading
`CHOOSE A SAVED SEARCH` — the same component as `SEARCH FOR A TAXON` and `EDIT LOCATION`.
Opens `SharedComponents/Sheets/BottomSheetV2` (`headerText`) holding the same list. Applying
also calls `setAdvancedSearchMode( true )`, matching the screen's own `handleSearch`. The
section is hidden when there are no saved searches.

## Stage 7 — Strings

Add the eight keys from spec §7 to `src/i18n/strings.ftl` (including `X-filters` with a plural
selector) and run `npm run translate`.

## Reuse (do not rewrite)

| Need | Existing |
|---|---|
| Subject identity | `subjectKey` — `stores/createExploreV2RecentSearchesSlice.ts` |
| Location text | `helpers/locationLabel.ts` |
| Filter count | `helpers/countFilters.ts` |
| Taxon name display | `SharedComponents/DisplayTaxonName` |
| No-photo thumbnail | `SharedComponents/IconicTaxonIcon` + `THUMBNAIL_CLASS` |
| Floating button look | `SharedComponents/Buttons/SortButton.tsx` |
| Section header look | `SharedComponents/CollapsibleSectionHeader.tsx` (as a model) |
| Sheet | `SharedComponents/Sheets/BottomSheetV2.tsx` |
| Cap message | `SharedComponents/Sheets/WarningSheet.tsx` |

## Verification

Per stage: `npx jest <the new test file>`, plus
`npx eslint <touched files>` and `npm run lint:tsc` filtered to the touched filenames and
compared against the pre-change baseline (the repo carries a large pre-existing error count).

Full pass at the end: `npm run lint`, `npm run test:unit`.

**I stop there — no simulator run.** Stage 5's swipe gesture is the one piece whose verdict
depends on a device, so it lands last and gets flagged as unverified rather than declared
working. Handing over with lint and tests green, here is the checklist for your own pass:

1. Enable ExploreV2 — About screen, 3-tap, Debug screen. **The debug override is not
   persisted**, so it needs re-enabling after every relaunch; for the persistence check it is
   easier to flip `ExploreV2Enabled` to `true` in `initialFeatureFlagConfig` locally.
2. Build a filtered search in Advanced Search, save it from results, confirm the star fills.
3. Force-quit, relaunch, confirm the search is still listed with the same three lines.
4. Apply it from Universal Search, then from the Advanced Search sheet; confirm the results
   header still points at Advanced Search after the second one.
5. Check the star's position against the real map buttons in map, grid, and list layouts, and
   on the Species tab.
6. Swipe-delete on both iOS and Android — the likeliest thing to need another round.

## Out of scope

Everything intent listed: sync, names, reordering, sharing, notifications, refreshing stale
labels, and the pre-existing `advancedSearchMode`-never-resets asymmetry.
