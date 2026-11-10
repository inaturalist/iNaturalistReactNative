---
paths:
  - "**/src/components/**"
  - "**/src/api/**"
  - "**/src/realmModels/**"
---

# Performance

- **No Realm query in render.** Query in a hook or an effect and hold the plain result; a
  query in the render body re-runs every render and blocks the JS thread.
- **Long lists are virtualized** — `FlashList`, or `FlatList` where one already exists. Give a
  stable `keyExtractor` (never the index) and hoist `renderItem` out of the render body; a new
  function identity each pass defeats recycling.
- **Request a bounded photo size.** `Photo.displayMediumPhoto`/`displayLargePhoto` for detail
  views, the `square` URL for list thumbnails. Never `original` in a list — that is a
  multi-megabyte download per row.
- **No MMKV or persisted-store write on a hot path** — scroll, gesture, camera frame, list
  item render. Persistence is synchronous; batch it or defer it to the interaction boundary.
- **`react-native-fs` promises all serialize on one native thread.** Fanning out concurrent
  file reads, writes or unlinks queues them rather than parallelizing, and starves other
  filesystem work while it drains.
- **Re-render storms come from identity, not volume.** An object or array literal built in
  render and passed as a prop, and a Zustand selector returning a fresh object, both change
  identity every pass. Select primitives, or memoize.
