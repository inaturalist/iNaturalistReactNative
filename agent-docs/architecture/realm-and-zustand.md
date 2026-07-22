# Realm Models & Zustand Store Architecture

## Overview

The app uses a hybrid persistence strategy: **Realm** for persistent observation/taxonomy data with offline support, and **Zustand** for ephemeral UI/workflow state (only the `layout` slice persists to MMKV).

## Realm Database

### Configuration
- **Schema Version:** bumped frequently — read the current value from `schemaVersion` in `src/realmModels/index.ts` rather than trusting a number here (it was 70 at the time of writing)
- **Storage Path:** `${DocumentDirectoryPath}/db.realm` (`DocumentDirectoryPath` imported from `@dr.pogodin/react-native-fs`)
- **Config File:** `src/realmModels/index.ts`

### Registered Models

The authoritative list is the `schema` array in `src/realmModels/index.ts` — consult it for the current set. At the time of writing it registers the following:

| Model | Type | Primary Key | Purpose |
|-------|------|-------------|---------|
| Observation | Primary | `uuid` | Core observation entity |
| User | Primary | `id` | User accounts |
| Taxon | Primary | `id` | Species/taxonomy data |
| Photo | Primary | `id` | Photo metadata |
| Sound | Primary | `id` | Sound metadata |
| QueueItem | Primary | `id` | Settings-sync work queue (locale/taxon-name changes) with retry; not the observation upload queue |
| Project | Primary | `id` | Project metadata |
| Comment | Embedded | — | Observation comments |
| Identification | Embedded | — | Species identifications |
| ObservationPhoto | Embedded | — | Photo ↔ Observation link |
| ObservationSound | Embedded | — | Sound ↔ Observation link |
| TaxonPhoto | Embedded | — | Photo ↔ Taxon link |
| Vote | Embedded | — | Votes/faves |
| Flag | Embedded | — | Flags on content |
| Application | Embedded | — | Application metadata |
| ObservationField | Embedded | — | Observation field definition |
| ObservationFieldValue | Embedded | — | Observation field value |
| ProjectObservation | Embedded | — | Project ↔ Observation link |
| ProjectObservationField | Embedded | — | Project observation field |

### Observation Model (Most Complex)

**File:** `src/realmModels/Observation.js`

Internal timestamps for sync tracking:
- `_created_at` — Local creation time
- `_updated_at` — Last local modification
- `_synced_at` — Last successful server sync (null = never synced)
- `_deleted_at` — Deletion timestamp
- `_pending_deletion` — Flag for server deletion

Key methods:
- `needsSync()` — Checks if obs or evidence needs sync
- `wasSynced()` — Returns `_synced_at !== null`
- `missingBasics()` — Validates required fields
- `mapApiToRealm()` — API response → Realm schema
- `mapObservationForUpload()` — Realm → API payload
- `saveLocalObservationForUpload()` — Persist local edits
- `upsertRemoteObservations()` — Batch update from server
- `filterUnsyncedObservations(realm)` — Query unsynced observations

### Migration Pattern

**File:** the `migration` function in `src/realmModels/index.ts`

Migrations are version-gated and process both old and new Realm objects in parallel. Note that not every `schemaVersion` bump adds a migration branch — the highest gate is lower than the current version (many bumps are additive and need no data migration):

```javascript
if ( oldRealm.schemaVersion < 59 ) { /* v59 logic */ }
if ( oldRealm.schemaVersion < 55 ) { /* older logic */ }
// ... back to schemaVersion < 3
```

**When changing schema:**
1. Modify the model file
2. Add migration logic in `src/realmModels/index.ts` gated by new version
3. Increment `schemaVersion` in the same file
4. Test migration from previous version

## Zustand Store

### Composition

**File:** `src/stores/useStore.js`

9 independent slices merged into a single store with automatic key collision detection:

```javascript
const nonUniqueKeys = Object.keys( keyCounts ).filter( k => keyCounts[k] > 1 );
if ( nonUniqueKeys.length > 0 ) {
  throw new Error( `Duplicate keys across slices: ${nonUniqueKeys}` );
}
```

### The 9 Slices

| Slice | File | Persisted? | Purpose |
|-------|------|-----------|---------|
| `createObservationFlowSlice` | `createObservationFlowSlice.ts` | No | Observation creation/editing workflow |
| `createUploadObservationsSlice` | `createUploadObservationsSlice.ts` | No | Upload queue, status, progress |
| `createSyncObservationsSlice` | `createSyncObservationsSlice.ts` | No | Server sync and deletion queue |
| `createLayoutSlice` | `createLayoutSlice.ts` | **Yes (MMKV)** | UI preferences, onboarding flags |
| `createExploreSlice` | `createExploreSlice.ts` | No | Explore tab view type |
| `createRootExploreSlice` | `createRootExploreSlice.ts` | No | Root explore filters and view |
| `createMyObsSlice` | `createMyObsSlice.ts` | No | My Observations scroll position, counts |
| `createFeatureFlagSlice` | `createFeatureFlagSlice.ts` | No | Feature flags for A/B testing |
| `createFirebaseTraceSlice` | `createFirebaseTraceSlice.ts` | No | Firebase Performance monitoring |

### Persistence (MMKV)

Only the `layout` slice persists, plus two legacy root-level fields:

```javascript
partialize: state => ( {
  isAdvancedUser: state.isAdvancedUser,  // legacy
  obsDetailsTab: state.obsDetailsTab,     // legacy
  layout: Object.keys( state.layout ).reduce( ( memo, key ) => {
    if ( typeof state.layout[key] !== "function" ) {
      memo[key] = state.layout[key];
    }
    return memo;
  }, {} ),
} )
```

MMKV backend: `src/stores/zustandMMKVBackingStorage.ts`

### Key Layout Slice State (Persisted)
- `isDefaultMode` — Default vs advanced UI mode
- `screenAfterPhotoEvidence` — "Match" | "Suggestions" | "ObsEdit"
- `shownOnce{}` — Onboarding cards shown flags
- `loginBannerDismissed` — Login banner state
- `justFinishedSignup` — Post-signup flag

## Realm ↔ Zustand Relationship

**Clear separation of concerns — they never directly interact:**

| Aspect | Realm | Zustand |
|--------|-------|---------|
| Data type | Persistent observations, taxa, users | Ephemeral UI/workflow state |
| Access hook | `useRealm()`, `useRealmQuery()` | `useStore()` |
| Storage | SQLite-based `.realm` file | MMKV (layout only) |
| Lifetime | Survives app restarts | Mostly cleared on restart |

### Data Flow Examples

**Creating an observation:**
1. User builds observation → Zustand `currentObservation` (JSON, not Realm)
2. User saves → `Observation.saveLocalObservationForUpload()` writes to Realm
3. Zustand state cleared; UUID added to `uploadQueue`

**Uploading:**
1. Realm queried for unsynced observations
2. Zustand tracks progress (`currentUpload`, `totalUploadProgress`)
3. On success: Realm `_synced_at` updated
4. On error: Zustand `errorsByUuid` stores error

**Syncing remote changes:**
1. API fetches remote observations
2. `Observation.upsertRemoteObservations()` updates Realm
3. Components re-render via Realm query results (no Zustand involvement)

## Working with Realm objects in the React layer

Three related gotchas, all stemming from the same root: the models were designed to flow **one direction (API → Realm)**, and the React layer has to fend for itself on the way back out.

### Don't pass live Realm objects around components

A live Realm object can be invalidated by the database underneath you (sync, write, deletion). Holding one in React/Zustand/reducer state, or across an `await`, is a latent crash. Convert to a plain object the moment data leaves the data layer — *before* storing in state, crossing an async boundary, or passing deep into children. `DefaultSearchOptions.tsx` (which calls `Taxon.mapRealmToPojo( realmTaxon )`) is the model to follow.

If you must keep a live object, guard every use with `.isValid()` (see `useCurrentUser`, `useLocalObservation`). Note that several hooks return **live** collections (e.g. `useIconicTaxa` returns a live `Results`), so the consumer is responsible for the conversion. Known risky spots that hold live objects across async writes: `IdentificationSheets.tsx` and `useObsDetailsSharedLogic.ts`.

### The Realm → plain-object converter is `mapRealmToPojo` (present on some models, not all)

Every model has `static mapApiToRealm(...)` for the inbound direction. For the outbound direction, the established convention is a `static mapRealmToPojo(...)` method — it exists on `Taxon`, `Project`, `ProjectObservationField`, and `ObservationField`, but has **not** been added to every model yet. `.toJSON()` is unreliable as a substitute — it drops `mapTo` aliases, so `Photo` had to override it and `Observation` distrusts it outright. When a model you need lacks `mapRealmToPojo`, prefer adding one (following the existing implementations) over hand-mapping fields inline in a component.

### Realm and API field names sometimes differ — legacy debt, not convention

Pre-schema-v3 fields were renamed snake_case to match the API wire format but kept a camelCase on-disk column via `mapTo` (e.g. accessor `preferred_common_name` / `default_photo`, but a *live* object also exposes `preferredCommonName` / `defaultPhoto`). Fields added after v3 have **no `mapTo`** and are plain snake_case in both Realm and the API (e.g. `rank_level`, `iconic_taxon_name`). There is no rule for which to use; when in doubt, check the model's `properties` definition for a `mapTo`.

## Common Operations

### Adding a new Zustand slice
1. Create `src/stores/createMyNewSlice.ts` following existing patterns
2. Add to the slices array in `src/stores/useStore.js`
3. Key collision detection will catch naming conflicts automatically
4. If state needs persistence, add to `partialize` config

### Adding a Realm model property
1. Add property to the model's `static schema` definition
2. Add migration logic in `src/realmModels/index.ts` gated by new version
3. Increment `schemaVersion`
4. Update any mappers (mapApiToRealm, mapForUpload) if needed
