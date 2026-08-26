# MOB-1704 — ExploreV2 Saved Searches (Intent)

- **Linear:** [MOB-1704](https://linear.app/inaturalist/issue/MOB-1704/explorev2-saved-searches) · project *Explore re-design* · estimate 4pt
- **Author:** Seth Peterson (captured with Claude, 2026-08-25)
- **Stage:** Intent — approved intent is the input to `spec.md`. No design or file-level plan here.

## Problem

ExploreV2 lets a user compose a search from three parts — a **subject** (taxon, user,
project, unobserved), a **location** (nearby, worldwide, place, map area), and a set of
**filters** (quality grade, date, media, rank, license, …) — via two surfaces:
`UniversalSearch` (subject + location, fast path) and `AdvancedSearch` (the full filter form).

Every search is ephemeral. The composed search lives in `ExploreV2Context`, a React context
inside the bottom-tab tree, so it does not survive a tab switch or a trip to the camera. The
only thing that persists today is the *ingredients*: `createExploreV2RecentSearchesSlice`
remembers recently used subjects and places, not searches.

The result: a user who checks the same query regularly — *research-grade fungi in Marin
County, photos only, this month* — rebuilds it by hand every time, and the cost grows with
each filter they had applied. The heavier the search, the more it deserves to be saved and
the more expensive it is to recreate.

## Proposed outcome

A user can save the search they are currently looking at and get it back later in one tap,
from either search surface.

- On `ExploreResults`, a **save toggle** stores the current search. Tapping it again unsaves.
- Saved searches appear as **rows in both `UniversalSearch` and `AdvancedSearch`**.
- Tapping a row **applies the whole search immediately** and returns to results.
- Rows carry **no user-supplied name**. A saved search is recognizable from its parts:
  subject, location, and the filters applied to it.
- Each row can be **deleted** from the list.

Saved searches are stored on the device. They are not an account feature in this MVP.

## Decisions taken at intent

| Question | Decision | Why |
|---|---|---|
| Storage | Device-local: new Zustand slice, persisted to MMKV via `useStore`'s `partialize` | No saved-search endpoint exists in `inaturalistjs` (only `saved_locations`), so anything synced needs server work first. Mirrors the existing recent-searches slice. |
| Naming | **No names.** The row displays subject + location + filters | Avoids composing display sentences from parts, which is an i18n problem (word order, pluralization, untranslated place names). The parts already have renderers. |
| Save entry point | `ExploreResults` only | The user saves after seeing results, when they know the search is worth keeping. Both search surfaces commit to the same context state, so one entry point covers searches built either way. |
| Save mechanics | Toggle: saving an already-saved search unsaves it. Dedupe by a canonical key over the saved fields | With no name, identity has to come from content. Precedent: `subjectKey` in the recents slice. |
| Delete | Per-row delete control in the list | Discoverable, and testable without long-press gymnastics. |
| Captured state | `subject`, `location`, `filters`, `sortBy`, `speciesSortBy` — **not** `activeTab` | Restores the search without yanking the user to a different tab than the one they are on. |
| Location modes | All four saved verbatim, including `MAP_AREA` bounds | `NEARBY` stays dynamic and re-resolves on apply; a saved map box reapplies exactly as drawn. |
| Apply from `AdvancedSearch` | Applies immediately and returns to results, **and sets `advancedSearchMode` to true** | Matches `AdvancedSearch.handleSearch`, so the results header keeps pointing back at the advanced form rather than silently demoting the user to the simple one. |

## Affected systems

- **New Zustand slice** for saved searches, wired into `src/stores/useStore.js` and its
  `partialize` list (which today persists `exploreRecentSearches.subjects` / `.places`).
- **New canonical-key helper** for dedupe and the save-toggle's is-saved check, over
  `{ subject, location, sortBy, speciesSortBy, filters }`.
- **New row component.** `RecentSearches` can't be reused: it renders through
  `UniversalSearchResult` and deliberately drops the `unknown` and `unobserved` subject types,
  both of which are legitimate saved searches (as is *no subject at all* — "all organisms").
  A row needs the header's vocabulary instead: `subjectLabel` (currently a **non-exported**
  local in `ExploreV2Header.tsx` — extraction required), `locationLabel`, and `countFilters`.
- **`ExploreResults` / `ExploreV2Header`** — the save toggle and its saved/unsaved state.
- **`DefaultSearchOptions`** — hosts the saved list in `UniversalSearch`'s empty-query state,
  alongside `RecentSearches`.
- **`AdvancedSearch`** — hosts the saved list and, on apply, commits to `ExploreV2Context`
  plus `setAdvancedSearchMode( true )`.
- **`strings.ftl`** — a small number of labels (section heading, save/unsave, delete).

## Constraints

- **Offline-first, no network.** Saving, listing, applying, and deleting must all work with
  no connection. Applying a saved search then runs the normal query, which needs the network
  like any other search.
- **Works logged out.** Storage is local; nothing here requires a JWT. (A saved search whose
  subject is `unobserved` is inherently a logged-in artifact, but it does not need special
  handling to *store*.)
- **No composed name strings in `strings.ftl`.** Row content is assembled from rendered
  parts, not from an interpolated sentence.
- **Bounded storage.** Saved searches are persisted JSON in MMKV and hold hydrated objects
  (`user`, `project`, place with `display_name`), so the list must be capped.
- **Accessibility.** The save toggle needs distinct labels for its two states; delete
  controls need labels that identify which row they act on.
- **No new feature flag.** This ships inside ExploreV2, which is already flagged.

## Explicitly out of scope

- Cross-device sync or any server persistence.
- User-supplied names, renaming, reordering, or pinning.
- Sharing a saved search, or deep-linking into one.
- Notifications or subscriptions attached to a saved search.
- Refreshing stale labels: a saved place name or taxon common name is rendered from the
  object captured at save time and will not follow a locale change or a server-side rename.
- Fixing the pre-existing asymmetry that `advancedSearchMode` is only ever set to `true` and
  never back to `false`. Worth a separate ticket; this feature must not depend on it changing.

## Open questions

1. **No design exists** (the Linear issue's Figma link is a stub). Where do the rows sit in
   each surface — above or below `RecentSearches` in `DefaultSearchOptions`, and where in the
   789-line `AdvancedSearch` form? Does this need design input before spec, or is
   engineering's proposal enough for an MVP?
2. **Tab on apply from `AdvancedSearch`.** That screen's `handleSearch` also dispatches
   `SET_ACTIVE_TAB: OBSERVATIONS_TAB`. Does applying a saved search from there mirror that,
   or leave the user's current tab alone (which is what "does not capture `activeTab`" implies)?
3. **Cap.** What number, and what happens at the cap — refuse with a message, or evict the
   oldest? (Recents cap at 10 and silently evict, but losing a *deliberately* saved search
   silently is worse than losing a recent one.)
4. **Does applying from `UniversalSearch` set `advancedSearchMode` to `false`?** Nothing in
   the app sets it false today, so doing it here would be new behavior; not doing it means a
   user in advanced mode who applies a saved search from the simple surface stays in advanced mode.
5. **Does sort belong in the dedupe key?** If it does, the same subject/location/filters saved
   under two different sorts are two rows — which may read as a duplicate to the user.
6. **Does applying a saved search also record its subject/place as recent?**
7. ~~**Branch base.**~~ *Resolved:* `mob-1348-advanced-search-mode` merged to `main`
   (`05d9a063e`), so MOB-1704 branches from `main` as `mob-1704-explorev2-saved-searches`.

## How we will know it works

- Unit tests for the slice (add / toggle-off / delete / cap) and for the canonical key
  (same search → same key; a changed filter → a different key; key is order-independent).
- Component tests: save toggle reflects saved state; a saved row renders subject, location,
  and filter count; tapping applies; delete removes.
- Simulator verification of the full loop — compose in `AdvancedSearch`, save from results,
  kill and relaunch the app, apply from both surfaces — since persistence and navigation are
  exactly what unit tests can't prove.
