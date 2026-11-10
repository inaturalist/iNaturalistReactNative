# Media Filesystem Lifecycle

Where photos and sounds live on disk, when they get copied, and what deletes
them. For the upload pipeline once media is on disk, see `upload-system.md`.

Photos and sounds live under `DocumentDirectoryPath` (from
`@dr.pogodin/react-native-fs`). Short-lived originals go to **staging
directories** during the observation-create flow; resized photos and sounds go
to **canonical upload directories** and persist until upload succeeds and
cleanup runs.

## Filesystem paths

`src/appConstants/paths.ts` is the authoritative list, all rooted at
`DocumentDirectoryPath`. Two things it does not tell you: `photoLibraryPhotosPath`
still uses the `galleryPhotos` folder name on disk (intentionally unchanged in
MOB-431 to avoid cache-cleanup regressions), and `sentinelFilePath` holds debug
sentinel files rather than media.

## How media arrives

- **Camera:** Vision Camera writes a temp file; `savePhotoToDocumentsDirectory`
  **moves** it (no resize) into `rotatedOriginalPhotos`. The URI sits in Zustand
  `cameraUris` until the user confirms, then `Photo.resizeImageForUpload` writes
  a max-2048px JPEG copy into `photoUploads`.
- **Gallery:** `moveImagesToDocumentsDirectory` moves picker files into
  `galleryPhotos`, then the same resize path runs.
- **Share extension:** URIs are often App Group paths outside
  `DocumentDirectoryPath`, so there is no staging step —
  `Photo.resizeImageForUpload` copies straight into `photoUploads`.
- **Sounds:** the recorder writes to a cache path;
  `Sound.moveFromCacheToDocumentDirectory` **moves** it into `soundUploads`
  under a UUID basename. Realm stores `file://${soundUploadPath}/${filename}`.

Resize is `resizeImage` at max width 2048, JPEG, quality 100,
`onlyScaleDown: true`. On iOS, `ph://` asset URIs go through
`copyAssetsFileIOS` instead of the resizer.

Between capture and the next app launch this leaves redundant copies: camera and
gallery each keep the original in staging *plus* the resized copy in
`photoUploads`; share keeps only one. Staging directories are cleared on every
deferred startup.

Always read a stored path back through `Photo.getLocalPhotoUri` (or
`Sound.getLocalSoundUri`). It normalizes to
`file://${photoUploadPath}/${filename}`, which is what keeps photos accessible
after an app update moves the container.

## `originalPhotoUri` is not persisted

`ObservationPhoto.new(uri)` sets `originalPhotoUri` on the in-memory
observation-create object to record where the photo came from: staging path for
camera, `galleryPhotos` for gallery, an App Group URI for share.
`shouldFetchObservationLocation` reads it to decide whether to fetch GPS —
camera photos may need it, gallery and share photos may already have EXIF
coordinates.

It is **not** in `ObservationPhoto.schema`. It exists only on the Zustand flow
object (`RealmObservationPhotoPojo` in `types.d.ts`), so it is gone the moment
the observation is read back from Realm.

## Rollback photos

Editing an existing observation copies files from `photoUploads` into
`rollbackPhotos` (`backupObservationPhotos`) so a cancel can revert.
`restoreObservationPhotos` copies them back and clears the directory;
`clearRollbackPhotos` also runs on observation-flow exit
(`useExitObservationFlow`) and on deferred startup.

## Cache cleanup runs on deferred startup, not in StartupService

`useDeferredStartup` schedules each task in its own `requestIdleCallback` so
filesystem work does not block first render. Consequence: media created during a
session lingers until the *next* launch.

| Task | Action |
|------|--------|
| `clearRotatedOriginalPhotosDirectory` | Empty `rotatedOriginalPhotos` |
| `clearGalleryPhotos` | Empty `galleryPhotos` |
| `clearComputerVisionPhotos` | Empty `computerVisionSuggestions` |
| `clearSyncedMediaForUpload` | In `photoUploads` and `soundUploads`, keep only files referenced by unsynced observations |
| `clearRollbackPhotos` | Empty `rollbackPhotos` |

### `removeSyncedFilesFromDirectory`

1. **Keep list:** filenames from unsynced observations
   (`observationPhotos._synced_at == nil` / `observationSounds._synced_at == nil`).
2. **30-day skip:** files modified within `TRASHABLE_VINTAGE_MS` are never
   deleted. This covers the race where a file is written just before its
   observation reaches Realm.
3. **5GB overflow — currently unreachable.** It is meant to delete
   largest-then-oldest files (excluding the keep list and anything modified in
   the last 24h) once kept plus skipped files exceed 5GB. As written the branch
   never runs: `deletionPromises` is not awaited, so `totalSize` is still `0` at
   the comparison and the function returns early. Do not plan around this rule
   until it is fixed.

## Deleting

- Removing one photo or sound from an observation unlinks the file:
  `ObservationPhoto.deletePhoto` → `deleteLocalPhoto` →
  `Photo.deletePhotoFromDeviceStorage`, and the `ObservationSound` equivalent.
- **`Observation.deleteLocalObservation` deletes only the Realm object.** It
  does not unlink media. Those files are collected on the next deferred startup,
  because the observation no longer exists to put its filenames on the keep list.
