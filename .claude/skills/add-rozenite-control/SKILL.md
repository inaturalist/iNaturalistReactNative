---
name: add-rozenite-control
description: Add a button, toggle, input, select, or text item to the app's Rozenite Controls DevTools panel. Use when asked to add a Rozenite control, a DevTools debug button/toggle/input, or an item to the "Operations"/"Feature Flags" style controls panel.
---

# Add a Rozenite control

This repo already wires up `@rozenite/controls-plugin`. "Adding a Rozenite
control" almost always means adding one more item to the existing plugin
registration, **not** scaffolding a new custom Rozenite plugin package.

## Where it lives

- `src/sharedHooks/useRozenite.tsx` — the single call site. It builds a
  `sections` array (via `createSection`) and passes it to
  `useRozeniteControlsPlugin({ sections })`. This hook runs inside
  `RozeniteContainer` in `index.js`, rendered as a sibling of `<App />` —
  both are children of `OfflineNavigationGuard`, which wraps them in
  `NavigationContainer`. So `useRozenite` *is* inside `NavigationContainer`,
  but it isn't nested inside any actual `Screen`. See "Navigating from a
  control" below for what that does and doesn't get you.
- `metro.config.js` gates Rozenite behind `withRozenite(..., { enabled:
  process.env.WITH_ROZENITE === "true" })`. To see the panel locally, run
  Metro with `WITH_ROZENITE=true npm start`. Rozenite plugins are automatic
  no-ops in production builds, so no dev/prod gating is needed in app code.

## Item types

All item types come from `@rozenite/controls-plugin` (`ControlsItem` union).
Only serializable fields cross the bridge to the DevTools panel — callbacks
(`onPress`, `onUpdate`, `validate`) run on-device and never leave the app:

```ts
type ControlsButtonItem = {
  id: string; type: "button"; title: string;
  actionLabel?: string; description?: string; disabled?: boolean;
  onPress: () => void | Promise<void>;
};

type ControlsToggleItem = {
  id: string; title: string; value: boolean;
  description?: string; disabled?: boolean; type: "toggle";
  validate?: (next: boolean) => ControlsValidationResult;
  onUpdate: (next: boolean) => void | Promise<void>;
};

type ControlsInputItem = {
  id: string; title: string; value: string;
  description?: string; disabled?: boolean; type: "input";
  placeholder?: string; applyLabel?: string;
  validate?: (next: string) => ControlsValidationResult;
  onUpdate: (next: string) => void | Promise<void>;
};

type ControlsSelectItem = {
  id: string; title: string; value: string;
  description?: string; disabled?: boolean; type: "select";
  options: { label: string; value: string }[];
  validate?: (next: string) => ControlsValidationResult;
  onUpdate: (next: string) => void | Promise<void>;
};

type ControlsTextItem = {
  id: string; type: "text"; title: string; value: string;
  description?: string; // read-only display, no interaction
};
```

`ControlsValidationResult` is `{ valid: true } | { valid: false; message: string }`.

## How to add one

1. Pick (or add) a section in the `sections` `useMemo` in `useRozenite.tsx`
   (e.g. `"operations"`, `"feature-flags"`) via `createSection({ id, title,
   items: [...] })`, or create a new section if the control doesn't fit any
   existing one.
2. If the control needs local state (e.g. an input's current value), add a
   `useState`/hook call inside `useRozenite` itself — item objects are
   rebuilt on every render, so state must live in this hook, not in the item
   literal.
3. Add the item object to the section's `items` array with a stable, unique
   `id`.
4. Add every value the item closes over (state, setters, other hook results)
   to the `useMemo` dependency array so the panel gets a fresh snapshot when
   they change. The hook already re-sends a snapshot on every relevant
   dependency change — you don't need to call anything manually.
5. For an `input`/`select`/`toggle`, use `validate` to reject bad input
   before `onUpdate` runs — the panel surfaces `{ valid: false, message }` as
   an inline error instead of calling `onUpdate`.

## Navigating from a control

`useRozenite` runs inside `NavigationContainer` (see "Where it lives"), so
`useNavigation()` works — it won't throw "Couldn't find a navigation
object." But `useRozenite` isn't nested inside a `Screen`, so it resolves to
the container's root ref rather than a real per-screen nav prop, which
doesn't have stack-specific sugar like `.push()`. Use
`navigation.dispatch( StackActions.push( "ScreenName", params ) )` instead
of `navigation.push(...)` — `.dispatch()` works from the root ref, `.push()`
doesn't. Guard with `navigation.isReady()` first, since the DevTools panel
can invoke a control before the navigator has mounted.

This is dev-only tooling and the app already tolerates one-off type errors
in places like this — don't fight the types here (e.g. `useNavigation()`'s
default type doesn't quite match what it resolves to at this call site).
Just accept the resulting `tsc` complaints rather than adding casts,
`@ts-expect-error`, or narrowed helper types to silence them.

## Example: paste-a-URL-and-navigate input control

```tsx
import { useNavigation } from "@react-navigation/native";
import { openInatUrl, parseInatUrl } from "sharedHelpers/inatUrlNavigation";
// ...inside useRozenite, alongside the other hook calls:
const [pastedUrl, setPastedUrl] = useState( "" );
const navigation = useNavigation();

// in the sections useMemo, e.g. within the "operations" section's items:
{
  id: "open-inat-url",
  type: "input",
  title: "Open iNat URL",
  description: "Paste an observation or taxon URL to navigate to it.",
  value: pastedUrl,
  placeholder: "https://www.inaturalist.org/observations/12345",
  applyLabel: "Go",
  validate: next => {
    const parsed = parseInatUrl( next );
    return parsed
      ? { valid: true }
      : { valid: false, message: "Not a recognized iNaturalist URL." };
  },
  onUpdate: async next => {
    setPastedUrl( next );
    const parsed = parseInatUrl( next );
    if ( parsed && navigation.isReady() ) {
      await openInatUrl( parsed, navigation );
    }
  },
}
// remember to add pastedUrl / navigation to the useMemo dependency array
```

`openInatUrl` (in `src/sharedHelpers/inatUrlNavigation.ts`) calls
`navigation.dispatch( StackActions.push( ... ) )` internally for the same
root-ref reason.

## Reference

The controls plugin's own bridge protocol (for context, not something you
need to touch): the panel sends `get-snapshot`/`update-request`/
`invoke-action`; the device replies with `snapshot`/`update-result`. Source:
`node_modules/@rozenite/controls-plugin/dist/react-native/index.d.ts` and
`@rozenite/plugin-bridge`'s README.
