# NativeWind v4: What's New and What to Watch For

This app migrated from NativeWind 2 to 4 (see `MOB-1148`). Most `className` usage
"just works" unchanged, but v4 resolves classes fundamentally differently than v2,
and that difference produces silent, no-error bugs — wrong size, wrong color, wrong
position, no visible change at all — rather than build failures. This doc explains
the mental model shift and the specific failure patterns found (and fixed) during
the migration, so the same bugs aren't reintroduced in new code.

## The core difference from v2

**v2** used a Babel transform. `<View className="p-4" />` was rewritten at compile
time into a component that resolved the class string to a style object **at
render time**, by interpreting the string directly against the Tailwind config.
Any class string — including one built at runtime from a variable — worked, and
whichever class came *last* in the resolved string generally won a conflict.

**v4** splits this into two independent halves:
1. A **build-time CSS pipeline** — `global.css`'s `@tailwind` directives are
   compiled to real CSS by PostCSS/Tailwind (via static content-scanning of
   `.tsx`/`.jsx`/`.ts`/`.js` source files), then converted into a JS rule table
   that Metro injects into the bundle.
2. A **runtime interop layer** (`react-native-css-interop`) that holds that rule
   table in memory and, when a *registered* component renders with a `className`
   prop, looks up the matching rule and produces a style object.

Because compilation happens by **statically scanning literal text in source
files**, not by evaluating JS at runtime, several v2 patterns that "just worked"
now fail silently. Below are the specific patterns to watch for, roughly in order
of how often they've bitten us.

## 1. Only registered components respond to `className`

Core React Native components (`View`, `Text`, `TextInput`, `Pressable`,
`ScrollView`, `Image`, `ImageBackground`, `Modal`, `ActivityIndicator`,
`FlatList`, `Touchable*`, `StatusBar`, `Switch`) are registered automatically.
**Everything else — any third-party / non-core-RN component — is not**, and a
`className` passed to it is silently dropped. No warning, no error; the prop is
just ignored.

This bit us repeatedly: `react-native-webview`'s `WebView`, `react-native-paper`'s
`TextInput` and `ActivityIndicator`, `react-native-maps`' `MapView`,
`react-native-draggable-flatlist`'s `DraggableFlatList`,
`react-native-reanimated-carousel`'s `Carousel`, and more — each one rendered
with wrong/default sizing, invisible content, or a broken layout because
`className` had zero effect.

**Fix:** register the component once with `cssInterop()` and export the styled
version so callers import it from one place instead of the raw package.
`src/components/styledComponents.ts` is the shared registry:

```ts
import { cssInterop } from "nativewind";
import { TextInput as UnstyledPaperTextInput } from "react-native-paper";

const PaperTextInput = cssInterop( UnstyledPaperTextInput, { className: "style" } );

export { PaperTextInput /* , ... */ };
```

Then import `PaperTextInput` (etc.) from `components/styledComponents` instead
of the raw package.

**Currently registered:** `SafeAreaView`, `BottomSheetTextInput`,
`LinearGradient`, `FasterImageView`, `PaperTextInput`, `PaperActivityIndicator`,
`WebView`, `DraggableFlatList`, `Carousel` (all in `styledComponents.ts`), plus
`MapView` (registered directly in `Map.tsx`, since it's only used there).

**If you introduce a new third-party visual component and it needs `className`,
register it here first** — don't discover this the hard way in a screenshot.

## 2. Conflicting classes resolve by stylesheet order, not by string order

In v2, when two classes touching the same CSS property landed on one element,
whichever was listed *last in the string* won. In v4, the winner is whichever
rule the Tailwind compiler happened to emit *later in the generated stylesheet*
— which has no reliable relationship to the order you wrote the classes in JS.

This mostly bites components that build up `"base classes" + "caller's override"`
with plain string concatenation (`classnames()`):

```tsx
// BROKEN under v4 — the caller's border-[2px] can lose to the component's own
// border-[3px] regardless of which one is "supposed" to win
buttonClasses.push( "border border-[3px]" );   // component default
if ( className ) buttonClasses.push( className ); // caller's override, e.g. "border-[2px]"
return classnames( buttonClasses );
```

This exact shape caused a reported bug: `Button`'s own default border width
(`border-[3px]`) was silently overriding callers that passed `border-[2px]`
to make a thinner border, because the caller's className was pushed into the
array *before* the level-specific defaults.

**Fix:** use `tailwind-merge`'s `twMerge()` instead of `classnames()` wherever
defaults and a caller's override are combined, and put the caller's override
**last** in the argument list (`twMerge` resolves same-property conflicts with
last-argument-wins, mirroring v2's semantics):

```tsx
// CORRECT
return twMerge( ...buttonClasses, className );
```

Already applied in `Button.tsx`, `ViewWrapper.tsx`, `BottomSheet.tsx`,
`INatIconButton.tsx`, and the `Typography/*` components. If you're writing a
component that accepts a `className` prop *and* has its own default classes,
use `twMerge`, not `classnames()`, to combine them.

**The same trap fires with no caller involved** — an unconditional base class
plus a conditional override of that same property, in one `classnames()` call:

```js
// BROKEN — bg-inatGreen never wins, because .bg-white is emitted later
className={classnames( "bg-white items-center", {
  "bg-inatGreen": isWhiteOnGreenStyling,
} )}
```

This shipped on `main` as MOB-1725: the upload banner's green lost to the
unconditional `bg-white` while `text-white` beat `text-darkGray`, leaving white
text on a white background — invisible, but still laid out and still tappable.

**Which side wins** is whichever value Tailwind emits later. For colors that's
the key order of `colors` in `tailwind.config.js`, so a base of `bg-white` or
`text-white` beats nearly any override — and reordering that config can break a
component nobody touched.

**Fix:** never emit two classes for the same property. A ternary makes the
conflict structurally impossible rather than merely resolving it:

```js
// CORRECT
className={classnames(
  "items-center",
  isWhiteOnGreenStyling
    ? "bg-inatGreen"
    : "bg-white",
)}
```

Mutually exclusive object keys (`{ "bg-white": a, "bg-warningRed": b }`) are
equally safe. For longer build-ups, wrap the call: `twMerge( classnames( ... ) )`.

**Don't just swap `classnames()` for `twMerge()`** — `twMerge` silently ignores
object arguments, so a find-and-replace deletes every conditional class:

```js
twMerge( "bg-white", { "bg-inatGreen": true } )                // => "bg-white"     dropped
twMerge( classnames( "bg-white", { "bg-inatGreen": true } ) )  // => "bg-inatGreen" correct
```

## 3. An inline `style` always beats a `className` for the same property

This is a plain CSS/RN fact that v2's resolution model happened to route around,
but v4 exposes directly: if a component sets `style={{ textAlign: "left" }}`
unconditionally and also accepts `className`, a caller's `text-center` class
**cannot win** — the inline style always wins for that property, no matter what
classes are present.

Two real bugs from this:
- `InatText`'s hardcoded `style={{ textAlign: "left" }}` beat every caller's
  `text-center`/`text-right` class.
- `INatIconButton`'s `style={{ width: 44, height: 44 }}` (its accessible-min-size
  default) beat every caller trying to size the button via `w-[36px] h-[36px]`
  className instead of the `width`/`height` props.

**Fix pattern:** don't put a "default" value into `style` unconditionally if a
caller might reasonably want to override it via className. Prefer expressing
the default as a **className** merged with `twMerge` instead of a literal style
value — that puts the default and the override through the same resolution
mechanism instead of two different ones:

```tsx
// INatIconButton.tsx — default size is a class, not a style, so a caller's
// own w-/h- className can win via twMerge
const DEFAULT_DIM_CLASSES = "w-11 h-11"; // 44px
...
const dimClassName = twMerge( DEFAULT_DIM_CLASSES, className );
```

`width`/`height` only enter `style` here when the caller explicitly passes them
as numeric props (a deliberate, dynamic-value escape hatch) — see the file for
the full pattern, including the props-validation nuance.

**A sharp edge inside this pattern:** if you conditionally build the style object,
setting a key to `undefined` is **not** the same as omitting the key. Object-merge
semantics (`Object.assign`/spread) let an explicit `undefined` *value* overwrite
a value that was merged in from elsewhere, whereas an *absent* key does not:

```tsx
// WRONG — the key is present (with value undefined), and can still clobber a
// className-derived value during nativewind's internal style merge
{ width: someCondition ? undefined : width }

// CORRECT — the key is entirely absent when the condition is true
{ ...( someCondition ? {} : { width } ) }
```

This exact mistake caused a second-order bug during the `INatIconButton` fix
above and only showed up as a snapshot-test failure, not a lint/type error —
worth being deliberate about whenever a style object's keys are conditional.

## 4. A class name built from a template literal never compiles

```tsx
const BUTTON_DIM = 40;
const classes = `h-[${BUTTON_DIM}px]`; // produces ZERO CSS, silently
```

Verified by hand-compiling: this generates **no rule at all**. Tailwind's
compiler finds candidate class names by scanning the *raw text* of source
files — it doesn't evaluate JS, so it never sees the resolved string
`"h-[40px]"`, only the literal (invalid) text `` h-[${BUTTON_DIM}px] ``. In v2
this worked because resolution happened at runtime against the actual
interpolated string.

This was found (and fixed) in `MediaNavButtons.tsx` and `TabletButtons.tsx`,
both of which built arbitrary-value size classes this way for camera/sound
recorder buttons — the button in question had *no* explicit size at all, and
fell back to whatever a sibling flex class happened to produce (in one case, a
tall, narrow green bar instead of a 40px circle).

**Fix:** write the literal class, don't interpolate a variable into it. If the
value needs to stay linked to a named constant for documentation purposes,
prefer Tailwind's own default scale over an arbitrary-value bracket when the
number allows it (Tailwind's scale is `n → n * 0.25rem`, so `40px` = `h-10`,
`44px` = `h-11` at this app's `16px` rem base):

```tsx
// WRONG
`h-[${BUTTON_DIM}px]`

// RIGHT — either works; prefer the scale utility when the px value maps cleanly
"h-10"                 // 2.5rem = 40px
"h-[40px]"              // also fine — it's a literal string, not interpolated
```

If a value is genuinely dynamic at runtime (can't be reduced to a small fixed
set of literal classes), it has to be expressed via `style`, not `className` —
nativewind cannot generate a CSS rule for every possible runtime number ahead
of time.

## 5. `space-x-*` / `space-y-*` are gone — use `gap-x-*` / `gap-y-*`

NativeWind 2 polyfilled `space-x-*`/`space-y-*`; v4 dropped them. They compile
to nothing and are silently ignored — the classic v4 failure mode again. 34
occurrences across 19 files were found and converted to `gap-x-*`/`gap-y-*`
during this migration (same visual result). If you see rows/columns with items
jammed together where there should be a gap, check for a stray `space-x`/`space-y`.

## 6. The rem base changed from 16px to 14px

NativeWind 4 defaults to inlining `1rem = 14px`; this app's whole spacing scale
was built against v2's `16px` assumption. This is already fixed globally —
`metro.config.js`'s `withNativeWind()` call sets `inlineRem: 16`, and
`tests/nativewind.setup.js` passes the same value when converting compiled CSS
for Jest. **Both must stay in sync.** If you ever see spacing/sizing that's
consistently ~12.5% smaller than expected, check that these two values still
match.

## Testing implications

Jest doesn't run Metro, so neither half of nativewind's pipeline (CSS
compilation, component registration) happens automatically in tests. This is
wired up manually:

- `tests/jest.globalSetup.js` compiles `global.css` with real
  PostCSS + Tailwind once per test run and caches the output.
- `tests/nativewind.setup.js` (a Jest `setupFiles` entry) registers the core
  components and injects the compiled CSS into the interop runtime, so
  `className` resolves to real style values in tests the same way it does
  on-device — this is what let the bugs above surface as concrete style-value
  assertions/snapshot diffs instead of being invisible to the test suite.

This relies on **undocumented internal paths** of `react-native-css-interop`
(`dist/runtime/components`, `dist/css-to-rn`, `dist/runtime/native/styles`).
A future `nativewind`/`react-native-css-interop` version bump could rename or
restructure these without it counting as a breaking change from their public
API's perspective — if classes stop resolving in tests after an upgrade, look
here first.

**`jest.mock()` factories can't use a plain `require("react")`.** The interop's
Babel plugin rewrites `React.createElement` (when `React` comes from a plain
`require("react")` or `import`) to reference a hoisted import, and
`jest.mock()` factories aren't allowed to reference out-of-scope variables like
that hoisted import. Use `jest.requireActual("react")` instead:

```js
// WRONG — throws "module factory is not allowed to reference out-of-scope variables"
jest.mock( "some/Component", () => {
  const React = require( "react" );
  return jest.fn( ( { children } ) => React.createElement( View, null, children ) );
} );

// CORRECT
jest.mock( "some/Component", () => {
  const React = jest.requireActual( "react" );
  return jest.fn( ( { children } ) => React.createElement( View, null, children ) );
} );
```

## Quick diagnostic checklist

| Symptom | Likely cause |
|---|---|
| `className` has no visible effect at all | Component isn't registered — see #1 |
| A caller's override class isn't winning over a component's own default class | Plain `classnames()` merge instead of `twMerge` — see #2 |
| An element renders in its default color/spacing when a condition should have overridden it | Unconditional base class plus a conditional override of the same property — see #2 |
| A numeric prop (`width`, `height`, alignment, etc.) should be overridable by className but isn't | An unconditional inline `style` value is beating the className — see #3 |
| Conditionally-omitted style value still seems to apply | A style key is set to `undefined` instead of omitted — see #3 |
| An arbitrary-value class (`h-[${x}px]`) has zero effect | Template-literal interpolation never compiles — see #4 |
| Missing gap between flex row/column items | Stray `space-x-*`/`space-y-*` — see #5 |
| Spacing/sizing is uniformly ~12.5% smaller than expected | rem-base mismatch between `metro.config.js` and `tests/nativewind.setup.js` — see #6 |
| A test asserting on resolved styles fails after a nativewind/css-interop bump | Internal API paths in `tests/nativewind.setup.js` may have moved — see Testing implications |
