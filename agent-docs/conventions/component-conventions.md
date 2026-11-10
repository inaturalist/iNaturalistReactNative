# Component Conventions

Rules version: `.claude/rules/nativewind.md`. NativeWind's failure modes:
`nativewind-v4.md`. This doc holds what neither of those covers.

## Structure

Components are arrow functions with an `interface Props` declared directly
above, organized by feature under `src/components/` (Camera, Explore,
MyObservations, …), not by kind. A component used by two features moves to
`src/components/SharedComponents/` rather than being imported across feature
directories.

NativeWind is the styling system. Some older components still use
`StyleSheet.create()`; leave them, but write new code in NativeWind even inside
a file that mixes both — the two coexist fine, and half-migrating a file is
worse than either. React Native Paper supplies a few Material components, which
must be imported from `components/styledComponents` to accept `className`.

## Accessibility

`eslint-plugin-react-native-a11y` enforces that interactive elements have a
label, so presence is not the interesting part. What it cannot check:

- **`accessibilityHint` is third person singular, ending in a period** — "Opens
  the camera." It describes the *result* of acting, so it should not repeat the
  label.
- **`accessibilityRole` must match behavior**, not appearance. A `Pressable`
  styled as a link is still `button` if it acts on this screen.
- **VoiceOver and TalkBack disagree** often enough that testing one is not
  testing both. Ordering and grouping in particular differ.
