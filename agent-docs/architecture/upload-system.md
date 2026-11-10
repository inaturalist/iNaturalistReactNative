# Upload System Architecture

Offline-first and queue-based: observations upload sequentially, media within one
observation uploads in parallel, and auth is revalidated at each stage. Media
upload is separate from observation metadata.

## The pipeline, per observation

1. **Media upload** (`uploadObservationMedia`) — raw photos and sounds to
   `inatjs.photos.create()` / `sounds.create()`, all in parallel via `Promise.all`.
2. **Create or update** (`createOrUpdateObservation`) — `create()` when
   `wasSynced() === false`, otherwise `update()` with `ignore_photos=true`. JWT
   revalidated first.
3. **Attach** (`attachMediaToObservation`) — `observation_photos.create()` and
   `observation_sounds.create()` link the uploaded media, including replacements
   for previously synced media.
4. **Realm sync** (`markRecordUploaded`) — writes the server `id`, sets
   `_synced_at`, clears `needs_sync`, retrying on Realm invalidation.

Steps 1–3 can each succeed while a later one fails, which is why an observation
can end up with orphaned server-side photos. Do not assume partial failure means
nothing was uploaded.

## Queue ordering is deliberately not FIFO

The queue lives in Zustand (`createUploadObservationsSlice`), not Realm.

- `filterUnsyncedObservations` returns results sorted `_created_at` **descending**
  (`.sorted( "_created_at", true )`).
- `uploadQueue` is consumed from the **tail** with `pop()`, while a single new
  UUID is added at the front with `unshift()`.

The two reversals cancel, so the net upload order is oldest-first. Changing
either one alone silently flips the order users see.

Unsynced means any of: `_synced_at == null`, `_synced_at <= _updated_at`, or any
`observationPhotos` / `observationSounds` / `projectObservations` /
`observationFieldValues` with `_synced_at == null`.

## Timeouts and wakefulness

- Each observation gets **5 minutes** (`setTimeout` plus
  `AbortController.abort()`), not each request. A slow connection with many
  photos hits this.
- `@sayem314/react-native-keep-awake` is activated on
  `setStartUploadObservations()` and deactivated on `completeUploads()` or
  `stopAllUploads()`. An early return that skips those leaves the screen awake.
- The toolbar resets 5 seconds after completion (`MS_BEFORE_TOOLBAR_RESET`).

## Error recovery

| Scenario | Recovery |
|----------|----------|
| No API token | `RECOVERY_BY.LOGIN_AGAIN` → navigate to `LoginStackNavigator` |
| Network failure | User retry (`recoveryPossible = true`) |
| Observation deleted server-side | Remove from queue, delete locally |
| Auth expired | Token revalidated at each step |
| Realm access error | Refresh and retry once |

The deleted-observation case is detected by **matching the error message string**
`That observation no longer exists.` — the 410 status appears only in code
comments. A server-side wording change breaks this branch silently.

## Progress

`EventRegister` events drive it. Per-observation total is
`1 + unsyncedMediaCount + 0.5 × alreadySyncedButModifiedMediaCount + projectAttachment`,
where `projectAttachment` is 1 when the observation is added to a project
(`trackProjectAttachment`) and 0 otherwise. Each unsynced media item emits 0.5
on upload and 0.5 on attach, so only already-synced-but-changed evidence
contributes a half. Toolbar progress is
`sum( currentIncrements ) / sum( totalIncrements )`.
