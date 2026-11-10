---
paths:
  - "**/src/realmModels/**"
  - "**/src/stores/**"
---

# Realm and Zustand — rationale in `agent-docs/architecture/realm-and-zustand.md`

## Changing a Realm schema

- Bump `schemaVersion` in `src/realmModels/index.ts` and add a version-gated branch to the
  `migration` function in the same file. Skipping either crashes on launch for every user who
  already has data. Read the current version from the file; never assume a number.
- Update the mappers (`mapApiToRealm`, `mapObservationForUpload`, `mapRealmToPojo`) that a
  new property needs to travel through.

## Reading and writing Realm objects

- Convert a Realm object to a plain object before it leaves the data layer: before storing it
  in React or Zustand state, crossing an `await`, or passing it deep into children. Use the
  model's `static mapRealmToPojo(...)`, adding one in the style of the existing ones if the
  model lacks it. `.toJSON()` is not a substitute — it drops `mapTo` aliases.
- Guard every use of a live object with `.isValid()`. Some hooks return live collections, so
  the consumer is the one that has to convert.
- Use the on-disk name for a `mapTo` field: `default_photo`, not `defaultPhoto`. Queries take
  either spelling, so the wrong form only fails when you read the value back. Check the
  model's `properties` — fields added after schema v3 have no `mapTo`.

## Zustand slices

- Register a new slice in the slices array in `src/stores/useStore.js`. All slices share one
  flat namespace, so prefix or nest new keys. Export the slice interface and annotate **what
  you take out** of the store, not the selector parameter — `useStore.js` is untyped, so the
  `any` escapes otherwise.
- Only add to `partialize` when state must survive a cold launch; it is JSON-serialized, so a
  `Set` or `Map` cannot be persisted.
- State that must survive a tab switch or a trip to the camera belongs in a slice, not
  context: `<Mortal>` unmounts the tab tree on blur, and `handleTabPress` resets it.
- The upload queue is Zustand state (`createUploadObservationsSlice`), not a Realm collection.
  The Realm `QueueItem` model is an unrelated settings-sync queue used by `useWorkQueue`;
  conflating the two breaks both. Also stated in `.claude/rules/api.md` for uploader work.
