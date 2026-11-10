# Realm and Zustand: how the two halves divide

Rules version of this: `.claude/rules/realm.md`. This doc is the *why*.

**Realm** holds persistent observation and taxonomy data and works offline.
**Zustand** holds ephemeral UI and workflow state; only the `layout` slice and
two legacy root fields (`isAdvancedUser`, `obsDetailsTab`) persist, through MMKV.
The two never talk to each other directly — an observation is built in Zustand,
written to Realm on save, and re-read from Realm afterwards.

## Migrations are version-gated, and not every bump needs one

The `migration` function in `src/realmModels/index.ts` is a stack of
`if ( oldRealm.schemaVersion < N )` branches, oldest last, each processing old
and new objects in parallel. The highest gate is well below the current
`schemaVersion` because many bumps are purely additive and need no data
migration — so a missing branch for the latest version is not evidence that
someone forgot one. Test the upgrade from the previous version, not just a
fresh install.

## Screen state that has to live in Zustand

**A React context mounted inside a bottom-tab screen cannot hold state that should survive navigation.** Two independent mechanisms destroy the tree:

1. `<Mortal>` wraps the entire tab navigator (`src/navigation/BottomTabNavigator/index.tsx`) and unmounts its children on blur. Any trip to `NoBottomTabStackNavigator` — camera, ObsEdit, PhotoLibrary — tears down all four tab stacks.
2. `handleTabPress` in `src/navigation/BottomTabNavigator/CustomTabBarContainer.tsx` dispatches `CommonActions.reset`, remounting the tab tree. It fires when re-tapping the active tab *and* when leaving the Menu or Notifications tab — so a tab you never touched still gets rebuilt.

Neither is avoidable from inside a screen, which is why several slices exist purely as a survival layer: `createMyObservationsSlice`, `createRootExploreSlice` (`rootStoredParams`), and the scroll-offset fields.

Symptom to recognise: state resets when the user switches tabs or comes back from the camera, but works fine while they stay put.

### Reducer-in-Zustand

When state already has a reducer, keep the reducer and move only its host. The
slice stores the state and exposes an **updater function**; the existing hook
keeps its `{ state, dispatch }` shape by composing the reducer itself, so call
sites do not change.

```ts
// stores/createMyThingSlice.ts
myThing: initialMyThingState,
updateMyThing: updater => set( state => ( { myThing: updater( state.myThing ) } ) ),
```

The updater indirection matters: if `stores/` imported the reducer from
`providers/`, the two would require each other while `useStore` is still
building its slices, and the slice could initialize as `undefined`.

`src/providers/MyObservationsContext.ts` is the worked example.
**`src/providers/ExploreV2Context.tsx` has the same problem and has not been
converted.** Two rules the pattern depends on:

- **Two selectors, never one composite.** `useStore( s => ( { state: s.myThing,
  dispatch: s.updateMyThing } ) )` allocates a new object on *every* store change
  app-wide — uploads, sync, everything — re-rendering the whole feature.
- **Keep high-frequency values out of the reducer state.** The My Observations
  map region is written on every pan; inside `myObservations` it would re-render
  every consumer of sort and search. It is a sibling field with its own setter,
  and components select a *derived boolean* (`myObservationsMapRegion !== null`)
  so they re-render only when it appears or disappears.

### Typing store access

`useStore.js` is untyped JavaScript, so `useStore( ... )` returns `any`. Annotating the selector's parameter is not enough — the `any` comes out the other side and silently spreads. Annotate **what you take out**:

```ts
const clearThing: MyThingSlice["clearThing"] = useStore(
  ( state: MyThingSlice ) => state.clearThing,
);
```

Export the slice interface for this. Note that `npm run lint:tsc` will not catch a mistake here: every error it reports is a *syntactic* TS8006/8008/8010 from Flow-annotated `.js` files, and TypeScript skips semantic checking for the whole program when syntactic errors exist. Verify with a scoped config that includes only `.ts`/`.tsx` files.

## Working with Realm objects in the React layer

Three gotchas with one root: the models were designed to flow **one direction,
API → Realm**, and the React layer has to fend for itself on the way back out.

### Don't pass live Realm objects around components

A live Realm object can be invalidated by the database underneath you (sync, write, deletion). Holding one in React/Zustand/reducer state, or across an `await`, is a latent crash. Convert to a plain object the moment data leaves the data layer — *before* storing in state, crossing an async boundary, or passing deep into children. `DefaultSearchOptions.tsx` (which calls `Taxon.mapRealmToPojo( realmTaxon )`) is the model to follow.

If you must keep a live object, guard every use with `.isValid()` (see `useCurrentUser`, `useLocalObservation`). Several hooks return **live** collections — `useIconicTaxa` returns a live `Results` — so the consumer does the conversion. `IdentificationSheets.tsx` and `useObsDetailsSharedLogic.ts` are known risky spots holding live objects across async writes.

### The Realm → plain-object converter is `mapRealmToPojo` (present on some models, not all)

Every model has `static mapApiToRealm(...)` for the inbound direction. For the outbound direction, the established convention is a `static mapRealmToPojo(...)` method — it exists on `Taxon`, `Project`, `ProjectObservationField`, and `ObservationField`, but has **not** been added to every model yet. `.toJSON()` is unreliable as a substitute — it drops `mapTo` aliases, so `Photo` had to override it and `Observation` distrusts it outright. When a model you need lacks `mapRealmToPojo`, prefer adding one (following the existing implementations) over hand-mapping fields inline in a component.

### Realm and API field names sometimes differ — legacy debt, not convention

Pre-schema-v3 fields were renamed snake_case to match the API wire format but kept a camelCase on-disk column via `mapTo` (e.g. accessor `preferred_common_name` / `default_photo`, but a *live* object also exposes `preferredCommonName` / `defaultPhoto`). Fields added after v3 have **no `mapTo`** and are plain snake_case in both Realm and the API (e.g. `rank_level`, `iconic_taxon_name`). There is no rule for which to use; when in doubt, check the model's `properties` definition for a `mapTo`.
