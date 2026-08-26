# MOB-1704 — ExploreV2 Saved Searches (Spec)

- **Intent:** [`intent.md`](./intent.md) · **Linear:** [MOB-1704](https://linear.app/inaturalist/issue/MOB-1704/explorev2-saved-searches)
- **Design canvas:** https://claude.ai/code/artifact/cb3d65da-04a4-4d32-a844-f68f32ed664b
- **Branch:** `mob-1704-explorev2-saved-searches` (off `main`)
- **Stage:** Spec — this is the input to `plan.md`. It fixes behavior, data shape, and
  surfaces; it does not decide file-by-file work order.

## 1. Scope

A user can save the search they are looking at, see their saved searches in both search
surfaces, apply one in a single tap, and remove one. Everything is stored on the device.
Out of scope, unchanged from intent: server sync, names or renaming, reordering, sharing,
notifications, and refreshing labels captured at save time.

## 2. Acceptance criteria

**S1 — Save.** *Given* I am on `ExploreResults` with any search applied, *when* I tap the
outlined star, *then* the search is saved and the star becomes filled.

**S2 — Unsave from results.** *Given* the current search is saved (filled star), *when* I tap
the star, *then* it is removed from saved searches and the star returns to outlined.

**S3 — Recognize.** *Given* I have saved searches, *when* I open Universal Search with both
fields empty, *then* a **Saved searches** section lists them newest first, each row showing
the subject, the location with a pin, and the number of filters applied.

**S4 — Apply from Universal Search.** *Given* that list, *when* I tap a row, *then* the whole
search (subject, location, filters, both sort orders) is applied and I am returned to
`ExploreResults` showing its results.

**S5 — Apply from Advanced Search.** *Given* I am on `AdvancedSearch`, *when* I tap
**CHOOSE A SAVED SEARCH** and then a row in the sheet, *then* the search is applied, I am
returned to `ExploreResults`, and the results header keeps pointing back at Advanced Search.

**S6 — Delete from the list.** *Given* a saved search row, *when* I swipe it and confirm the
delete action, *then* it is removed from every surface.

**S7 — Persistence.** *Given* saved searches, *when* I force-quit and relaunch the app,
*then* they are all still there, in the same order.

**S8 — Duplicates.** *Given* a search identical to one already saved, *when* I tap the star,
*then* it unsaves that entry rather than creating a second one (the star already reads filled).

**S9 — Cap.** *Given* 20 saved searches, *when* I tap the star on a new search, *then* nothing
is saved and a sheet tells me the limit is reached and to remove one.

**S10 — Logged out.** *Given* I am not signed in, *when* I use any of the above, *then* it all
works; nothing requires a JWT.

**S11 — Offline.** *Given* no connection, *when* I save, list, apply, or delete, *then* all
four work. The search that runs after applying fails or succeeds like any other search.

## 3. Data model

### 3.1 The stored record

```ts
interface SavedSearch {
  key: string;            // canonical identity, see 3.2
  savedAt: number;        // Date.now( ) at save; list is sorted desc
  subject: ExploreV2Subject | null;
  location: ExploreV2LocationState;
  sortBy: OBSERVATIONS_SORT;
  speciesSortBy: SPECIES_SORT;
  filters: ExploreV2Filters;
}
```

The five state fields are stored **verbatim** from `ExploreV2State` — no transformation — so
applying is a straight dispatch and nothing has to be re-hydrated. `activeTab` is deliberately
not stored.

Note on size: `filters.user` / `.excludeUser` / `.project` are whole `ApiUser` /
`ApiProjectSummary` objects as they arrive from autocomplete. At a cap of 20 the persisted
payload stays small; if it ever doesn't, narrowing those to the fields the row and the query
actually use is a follow-up, not part of this change.

### 3.2 Canonical key

`savedSearchKey( search )` — new helper in
`src/components/Explore/ExploreV2/helpers/savedSearchKey.ts`. It is the identity used for the
is-saved check, for the save toggle, and for React keys. It must be **stable**, so it is built
from named fields in a fixed order — never `JSON.stringify` of an object, whose key order and
`undefined` handling are not guaranteed.

```
key = [subjectPart, locationPart, filtersPart].join( "|" )

subjectPart   subject ? subjectKey( subject ) : "none"
              ( subjectKey is the existing export from createExploreV2RecentSearchesSlice )

locationPart  WORLDWIDE -> "worldwide"
              NEARBY    -> "nearby"
              PLACE     -> `place-${place.id}`
              MAP_AREA  -> `bounds-${swlat},${swlng},${nelat},${nelng}`, each toFixed( 4 )

filtersPart   every key of ExploreV2Filters in a fixed declared order, as `${field}=${value}`,
              joined by ";" — with user / excludeUser / project reduced to their ids,
              months sorted ascending and comma-joined, and null / undefined both "".
```

**Sort is not part of the key** (see 6.4). Two searches differing only in sort order are the
same saved search.

### 3.3 Store slice

New `src/stores/createExploreV2SavedSearchesSlice.ts`, following
`createExploreV2RecentSearchesSlice`:

```ts
interface ExploreV2SavedSearchesSlice {
  exploreSavedSearches: {
    searches: SavedSearch[];                              // newest first
    saveSearch: ( _search: Omit<SavedSearch, "key" | "savedAt"> ) => void;
    removeSearch: ( _key: string ) => void;
  };
}
```

- `saveSearch` computes the key. If it already exists, the entry is **removed** (the toggle's
  unsave path). If not, and the list is under the cap, the new entry goes to the front.
- `SAVED_LIMIT = 20`. At the cap `saveSearch` is a no-op; the caller detects the full list and
  shows the sheet in S9. It never evicts — a deliberately saved search must not disappear
  silently. (Recents evict at 10; that is the correct difference between the two.)
- Wire into `src/stores/useStore.js` alongside the other slices, and add
  `exploreSavedSearches: { searches: state.exploreSavedSearches.searches }` to `partialize`
  so only the data persists, not the functions.

## 4. Surfaces

### 4.1 Save toggle — `ExploreResults`

A new `SaveSearchButton` in `src/components/Explore/ExploreV2/components/`, rendered as a
sibling of `SortButton` inside `ExploreResults` so one instance serves every layout.

- Visually identical to `SortButton`: `INatIconButton`, 46×46, `bg-white rounded-full`,
  `border-[1px] border-lightGray`, `absolute z-10 right-5`, `getShadow( { offsetHeight: 4,
  elevation: 6 } )`.
- Icon `star` (filled, `inatGreen`) when the current search is saved, `star-bold-outline`
  (`darkGray`) when it is not. Both glyphs already exist in the icon font — no font work.
- Vertical position: `bottom-[140px]` on the map layout, clearing the layers button
  (`bottom-20`) and the current-location button (`bottom-5`); `bottom-[76px]` otherwise,
  clearing `SortButton` at `bottom-5`. It is shown in **all** layouts and on both tabs.
- Saved state is derived: `searches.some( s => s.key === savedSearchKey( currentState ) )`.

### 4.2 Universal Search — `DefaultSearchOptions`

Order in the empty state, unchanged above the new section: iconic taxa row, current user,
"Species I haven't observed", then **Saved searches**, then **Recent searches**.

Both sections get a heading modelled on `CollapsibleSectionHeader` — divider, 18px leading
icon, `Body3` title, count at the right, `px-[15px] py-[10px]` — but **without** the caret,
and not collapsible. Simplest route is a small local presentational component; reusing
`CollapsibleSectionHeader` would drag in `isOpen` / `onToggle` for behavior we do not want.

- Saved searches heading: `star` icon. Recent searches heading: a clock icon.
- Each section renders nothing at all — heading included — when it has no rows. `RecentSearches`
  already returns `null` when empty; the new heading must respect the same rule.

### 4.3 The saved-search row

New `SavedSearchRow` component. Three lines beside a 62px leading thumbnail, in a
`px-[15px] py-[11px]` row with a `border-b border-lightGray`:

1. **Subject.** For a taxon subject, `DisplayTaxonName` (so common/scientific preferences are
   honored, as in the header). Otherwise `Body1` with the subject's label.
2. **Location.** 15px `location` icon + `Body3` from `locationLabel( location, t )`.
3. **Filters.** 15px `sliders` icon + `Body3` reading the count from
   `countFilters( filters )`. Omitted entirely when the count is zero.

Thumbnail rules: the taxon photo when there is one; otherwise `IconicTaxonIcon` at
`THUMBNAIL_CLASS`, which is also what covers a search with **no** subject and an `unobserved`
subject; a user subject uses `UserIcon size={62}`; a project uses its icon, falling back to the
existing lightGray briefcase tile.

`subjectLabel` currently lives as a non-exported local in `ExploreV2Header.tsx`. Extract it to
`src/components/Explore/ExploreV2/helpers/subjectLabel.ts` and have both the header and the row
import it — do not copy it.

**Swipe to delete.** The row is wrapped in `ReanimatedSwipeable`
(`react-native-gesture-handler`, already a dependency at ^2.30.0) revealing a `warningRed`
delete action. There is **no swipeable list anywhere in this app today** — see 9.

### 4.4 Advanced Search

At the top of the form, above `TAXON`, a section that matches the sections around it: a
`Heading4` reading `SAVED SEARCHES` and a standard outlined `Button` reading
`CHOOSE A SAVED SEARCH` — same component and styling as `SEARCH FOR A TAXON` and
`EDIT LOCATION`. The button opens a `BottomSheetV2` (`headerText` = "SAVED SEARCHES") holding
the same `SavedSearchRow` list, swipe-to-delete included.

The section is hidden when there are no saved searches.

## 5. Applying a search

One shared helper — `applySavedSearch( search, dispatch )` — used by both surfaces, so the two
paths cannot drift:

```
subject   ? SET_SUBJECT( subject ) : CLEAR_SUBJECT
location  -> SET_LOCATION_WORLDWIDE | SET_LOCATION_NEARBY
           | SET_LOCATION_PLACE( place ) | SET_LOCATION_MAP_AREA( bounds )
             ( switch with an exhaustiveness check, as AdvancedSearch.handleSearch does )
SET_SORT( sortBy )
SET_SPECIES_SORT( speciesSortBy )
SET_FILTERS( filters )
```

Then `navigation.popTo( "ExploreResults" )`.

Three deliberate omissions and one addition:

- **No `SET_ACTIVE_TAB`.** The user stays on whichever tab they are viewing (6.1).
- **No recents are recorded.** Applying a saved search does not push its subject or place into
  recent searches (6.5).
- **`advancedSearchMode` is not touched** when applying from Universal Search (6.3).
- Applying from the Advanced Search sheet additionally calls `setAdvancedSearchMode( true )`,
  matching `AdvancedSearch.handleSearch`.

## 6. Questions the intent left to spec

| # | Question | Decision | Why |
|---|---|---|---|
| 6.1 | Tab on apply from Advanced Search | Never dispatch `SET_ACTIVE_TAB` | `activeTab` is not part of a saved search, so restoring one has no tab to restore. `AdvancedSearch.handleSearch` forces the Observations tab because the user just built a query; applying a saved search is a restore, and an unexplained tab jump is the only motion the user did not ask for. |
| 6.2 | Cap, and what happens at it | 20; refuse and explain via `WarningSheet` | Silently evicting the oldest is acceptable for recents and not for something the user deliberately kept. There is no toast component in this app, so the sheet is the available way to say so. **Needs product sign-off on the number and on using a modal for it.** |
| 6.3 | Does applying from Universal Search clear `advancedSearchMode`? | No | Nothing in the app sets that flag to `false` today. Clearing it here would be new behavior smuggled in under this feature; the flag's asymmetry is a separate ticket (see intent, out of scope). |
| 6.4 | Is sort part of the dedupe key? | No — stored and restored, but not part of identity | The row shows subject, location, and filter count. Two entries differing only in sort would be pixel-identical to the user and read as a bug. Saving the same search with a different sort therefore toggles the existing entry off; saving it again stores the current sort. |
| 6.5 | Does applying record a recent? | No | Recents are for things you searched for and might want again. A saved search is already listed directly above; echoing it into recents duplicates the row on one screen. |

## 7. Strings

New keys in `src/i18n/strings.ftl` (run `npm run translate` after adding). No composed
sentences — each is standalone:

- `Saved-searches` — section heading and sheet title.
- `Recent-searches` — heading for the existing recents list.
- `CHOOSE-A-SAVED-SEARCH` — Advanced Search button.
- `X-filters` — the row's third line, pluralized with a selector:
  `{ $count } { $count -> [one] filter *[other] filters }`.
- `Save-this-search` / `Remove-this-saved-search` — the star's two accessibility labels.
- `Delete-saved-search` — swipe action label.
- `Saved-search-limit-reached` and its body copy — the S9 sheet.

## 8. Accessibility

- The star is a single button whose `accessibilityLabel` changes with state
  (`Save-this-search` / `Remove-this-saved-search`), with `accessibilityState={{ selected }}`.
  Never a label that says one thing while the icon shows another.
- A row is one button labelled with its subject and location; the swipe action is exposed
  separately so it is reachable without the gesture.
- Section headings are static text, not buttons, since they do not collapse.
- Counts read as text, not as a decorative badge.

## 9. Risks

- **Swipe-to-delete is new ground.** No component in this repo uses `Swipeable`. Budget for
  the gesture-vs-scroll conflict inside `DefaultSearchOptions`' `ScrollView` and inside the
  bottom sheet — gorhom sheets and gesture-handler interact badly if the sheet's own pan
  gesture is not accounted for. If this fights back, the fallback is the star as the only
  delete path for the MVP, which is a spec change, not a silent drop.
- **MMKV payload.** Persisted verbatim; see 3.1.
- No Realm schema change, no migration, no API work, no new feature flag.

## 10. Test plan

Unit:
- `savedSearchKey` — identical searches match; a changed filter, place, or subject does not;
  differing only in sort **does** match; `MAP_AREA` bounds round consistently; no-subject and
  `unobserved` produce distinct stable keys.
- The slice — add, toggle-off, delete by key, ordering newest-first, no-op at the cap.

Component:
- The star reflects saved state and flips on press; at the cap it does not save and the sheet
  appears.
- A row renders all three lines, omits the third at zero filters, and uses the placeholder
  thumbnail for a subject with no photo.
- Tapping a row dispatches the full set of actions in 5 (assert on resulting state, not on
  dispatch calls).
- Sections and their headings are absent when their lists are empty.

Needs a simulator (per `agent-docs/testing/e2e.md` and the intent's DoD): the persistence loop
across a relaunch, the swipe gesture on both platforms, and the star's position against the
real map buttons in every layout.
