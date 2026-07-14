# Upload System Architecture

## Overview

The upload system implements an offline-first, queue-based architecture that uploads observations sequentially while processing media in parallel. It separates media uploads from observation metadata, enforces sequential processing per observation, and revalidates authentication at each stage.

## Key Files

| File | Purpose |
|------|---------|
| `src/uploaders/observationUploader.ts` | 4-step upload pipeline (media → create/update → attach → persist) |
| `src/uploaders/mediaUploader.ts` | Media filtering, classification, parallel upload |
| `src/uploaders/dataTransformation/prepareObservationForUpload.ts` | Observation → API payload |
| `src/uploaders/dataTransformation/prepareMediaForUpload.ts` | Photo/Sound → API payload |
| `src/uploaders/utils/errorHandling.ts` | Error classification and recovery |
| `src/uploaders/utils/progressTracker.ts` | Event-based progress tracking |
| `src/uploaders/utils/realmSync.ts` | Post-upload Realm persistence |
| `src/stores/createUploadObservationsSlice.ts` | Zustand state (queue, status, progress) |
| `src/components/MyObservations/hooks/useUploadObservations.ts` | Entry point, upload loop control |
| `src/components/MyObservations/hooks/useSyncObservations.ts` | Server sync integration |

## Upload Pipeline (4 Steps)

Each observation follows this strict sequence:

1. **Media Upload** (`uploadObservationMedia()`) — Upload raw photos/sounds to server via `inatjs.photos.create()` / `inatjs.sounds.create()`. Processes all media in parallel via `Promise.all()`.

2. **Observation Create/Update** (`createOrUpdateObservation()`) — If `observation.wasSynced() === false`, creates via `inatjs.observations.create()`. If previously synced, updates with `ignore_photos=true`. Revalidates JWT before API call.

3. **Media Attachment** (`attachMediaToObservation()`) — Attaches uploaded media to the observation via `inatjs.observation_photos.create()` and `inatjs.observation_sounds.create()`. Handles updates to previously synced media.

4. **Realm Sync** (`markRecordUploaded()`) — Updates local Observation with server-assigned `id`, sets `_synced_at` timestamp, clears `needs_sync` flag. Handles Realm invalidation errors with retry.

## Queue & State Management

The Zustand slice (`createUploadObservationsSlice`) manages:

- `uploadQueue` — FIFO queue of observation UUIDs
- `uploadStatus` — `PENDING` | `IN_PROGRESS` | `COMPLETE` | `CANCELLED`
- `currentUpload` — Observation being processed
- `abortController` — Enables cancellation via AbortSignal
- `totalUploadProgress[]` — Per-observation progress tracking
- `totalToolbarProgress` — Aggregate progress 0-1 for toolbar UI
- `errorsByUuid` — Maps UUID → array of error messages

## Upload Flow

1. `startUploadObservations()` filters unsynced observations from Realm
2. UUIDs added to queue, status set to `IN_PROGRESS`
3. An effect watches `uploadStatus`, `uploadQueue`, `currentUpload`
4. When queue has items and no current upload, pops next UUID
5. Fetches Observation from Realm, calls `uploadObservationAndCatchError()`
6. On success: removes from queue. On error: stores error, removes from queue.
7. When queue empty: `completeUploads()` → status = `COMPLETE`
8. UI resets after 5 seconds (`MS_BEFORE_TOOLBAR_RESET`)

**Timeout**: Each observation upload limited to 5 minutes (300,000ms) via `setTimeout` + `AbortController.abort()`.

## Unsynced Detection

`Observation.filterUnsyncedObservations(realm)` queries:
```
_synced_at == null
  OR _synced_at <= _updated_at
  OR ANY observationPhotos._synced_at == null
  OR ANY observationSounds._synced_at == null
```
Results sorted by `_created_at` (oldest first).

## Error Handling

| Scenario | Recovery |
|----------|----------|
| No API Token | `RECOVERY_BY.LOGIN_AGAIN` → navigate to LoginStackNavigator |
| Network Failure | User retry (recoveryPossible=true) |
| Observation Deleted (HTTP 410) | Remove from queue, delete locally |
| Auth Expired | Token revalidated at each step |
| Realm Access Error | Refresh and retry once |

## Progress Tracking

Event-driven via `EventRegister`:
- `trackObservationUpload(uuid)` → emits `INCREMENT_SINGLE_UPLOAD_PROGRESS` with 0.5 increments
- `trackEvidenceUpload(uuid)` → emits for each photo/sound upload and attachment
- Per-observation total = 1 (obs) + count(unsyncedPhotos) × 0.5 + count(unsyncedSounds) × 0.5
- Toolbar progress = sum(currentIncrements) / sum(totalIncrements)

## Keep-Awake

Uses `@sayem314/react-native-keep-awake` to prevent device sleep during uploads. Activated on `setStartUploadObservations()`, deactivated on `completeUploads()` or `stopAllUploads()`.

## Common Operations

### Adding error handling to upload flow
1. Define error in `src/uploaders/utils/errorHandling.ts`
2. Catch in `useUploadObservations.ts` → `uploadObservationAndCatchError()`
3. Store via `addUploadError(message, uuid)` in Zustand

### Modifying upload payload
1. Update mapper in `src/uploaders/dataTransformation/prepareObservationForUpload.ts`
2. If schema changed, also update `Observation.mapObservationForUpload()` in `src/realmModels/Observation.js`
