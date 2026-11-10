# NativeWind v4: the silent failure modes

Rules version of this: `.claude/rules/nativewind.md`. This doc is the *why*.

## Why v4 fails quietly where v2 did not

v2 resolved `className` **at render time** via a Babel transform, interpreting
the class string against the Tailwind config. Any string worked, including one
built at runtime, and the last class in the string generally won a conflict.

v4 splits that into two halves that never see your runtime values: a
**build-time CSS pipeline** where Tailwind statically scans the *raw text* of
source files and Metro injects the compiled rules, and a **runtime interop
layer** (`react-native-css-interop`) that looks a rule up when a *registered*
component renders with a `className`.

So anything the static scan cannot see, or any component the interop does not
know, produces no style and no warning. Every item below is a bug we shipped,
ordered by how often it has bitten us.

## 1. Only registered components respond to `className`

Core RN components (`View`, `Text`, `TextInput`, `Pressable`, `ScrollView`,
`Image`, `ImageBackground`, `Modal`, `ActivityIndicator`, `FlatList`,
`Touchable*`, `StatusBar`, `Switch`) are registered automatically. Everything
else — every third-party component — is not, and its `className` is dropped
with no warning.

This has bitten `WebView`, Paper's `TextInput` and `ActivityIndicator`,
`MapView`, `DraggableFlatList` and `Carousel`, each rendering with default
sizing, invisible content, or a broken layout.

**Fix:** register once with `cssInterop()` in `src/components/styledComponents.ts`
and import the styled export from there instead of the raw package.

```ts
import { cssInterop } from "nativewind";
import { TextInput as UnstyledPaperTextInput } from "react-native-paper";

const PaperTextInput = cssInterop( UnstyledPaperTextInput, { className: "style" } );
```

`MapView` is the exception — registered directly in `Map.tsx`, its only caller.

## 2. Conflicting classes resolve by stylesheet order, not string order

The winner is whichever rule Tailwind emitted *later in the generated
stylesheet*, which bears no relation to the order you wrote the classes. For
colors that order is the key order of `colors` in `tailwind.config.js`, so a
base `bg-white` or `text-white` beats nearly any override — and reordering that
config can break a component nobody touched.

Two shapes trigger it:

**A component's defaults versus a caller's override.** `Button`'s own
`border-[3px]` silently beat callers passing `border-[2px]`.
**Fix:** combine with `tailwind-merge`'s `twMerge()`, caller's override last —
it resolves same-property conflicts last-argument-wins, mirroring v2.

```tsx
return twMerge( ...buttonClasses, className );
```

Applied in `Button.tsx`, `ViewWrapper.tsx`, `BottomSheet.tsx`,
`INatIconButton.tsx` and `Typography/*`.

**An unconditional base class plus a conditional override of the same
property**, with no caller involved:

```js
// BROKEN — bg-inatGreen never wins, because .bg-white is emitted later
className={classnames( "bg-white items-center", {
  "bg-inatGreen": isWhiteOnGreenStyling,
} )}
```

This shipped on `main` as MOB-1725: the upload banner's green lost to
`bg-white` while `text-white` beat `text-darkGray`, leaving white text on a
white background — invisible, still laid out, still tappable.

**Fix:** never emit two classes for one property. A ternary makes the conflict
structurally impossible; mutually exclusive object keys are equally safe. For
longer build-ups, wrap the call: `twMerge( classnames( ... ) )`.

**Do not blanket-replace `classnames()` with `twMerge()`** — `twMerge` silently
ignores object arguments, so a find-and-replace deletes every conditional class:

```js
twMerge( "bg-white", { "bg-inatGreen": true } )                // => "bg-white"     dropped
twMerge( classnames( "bg-white", { "bg-inatGreen": true } ) )  // => "bg-inatGreen" correct
```

## 3. An inline `style` always beats a `className` for the same property

Plain CSS/RN behavior that v2's model routed around. `InatText`'s hardcoded
`style={{ textAlign: "left" }}` beat every caller's `text-center`;
`INatIconButton`'s `style={{ width: 44, height: 44 }}` beat every caller sizing
it with `w-[36px] h-[36px]`.

**Fix:** express a default a caller might override as a className merged with
`twMerge`, not as a literal style value, so default and override go through one
resolution mechanism. `INatIconButton` now uses `DEFAULT_DIM_CLASSES = "w-11 h-11"`,
and `width`/`height` reach `style` only when passed as explicit numeric props.

**Sharp edge inside that pattern:** setting a style key to `undefined` is not
the same as omitting it. An explicit `undefined` value can overwrite a value
merged in from elsewhere; an absent key cannot.

```tsx
{ width: someCondition ? undefined : width }        // WRONG — key present
{ ...( someCondition ? {} : { width } ) }           // CORRECT — key absent
```

That caused a second-order bug during the `INatIconButton` fix and surfaced only
as a snapshot failure — no lint or type error.

## 4. A class name built from a template literal never compiles

```tsx
const classes = `h-[${BUTTON_DIM}px]`; // produces ZERO CSS, silently
```

Tailwind scans raw source text and never evaluates JS, so it sees the literal
text `` h-[${BUTTON_DIM}px] ``, not `h-[40px]`. Found in `MediaNavButtons.tsx`
and `TabletButtons.tsx`, where the button had no size at all and fell back to
whatever a sibling flex class produced — in one case a tall narrow green bar
instead of a 40px circle.

**Fix:** write the literal class. `"h-10"` and `"h-[40px]"` both work; prefer
the scale utility when the px value maps cleanly (this app's rem base is 16px,
so `40px` = `h-10`, `44px` = `h-11`). A genuinely runtime-dynamic value has to
go through `style` — no CSS rule can be pre-generated for every possible number.

## 5. `space-x-*` / `space-y-*` are gone

v2 polyfilled them; v4 dropped them and they compile to nothing. 34 occurrences
across 19 files were converted to `gap-x-*` / `gap-y-*` during the migration.
Items jammed together where there should be a gap is the symptom.

## 6. The rem base changed from 16px to 14px

v4 defaults to `1rem = 14px`; this app's whole spacing scale assumes v2's 16px.
Already fixed globally — `metro.config.js`'s `withNativeWind()` sets
`inlineRem: 16` and `tests/nativewind.setup.js` passes the same value. **Both
must stay in sync.** Sizing uniformly ~12.5% smaller than expected means they
have drifted.

## Testing implications

Jest does not run Metro, so neither half of the pipeline happens on its own.
`tests/jest.globalSetup.js` compiles `global.css` with real PostCSS + Tailwind
once per run and caches it; `tests/nativewind.setup.js` registers the core
components and injects the compiled CSS into the interop runtime. That is what
lets the bugs above surface as concrete style assertions instead of staying
invisible to the suite.

This relies on **undocumented internal paths** of `react-native-css-interop`
(`dist/runtime/components`, `dist/css-to-rn`, `dist/runtime/native/styles`). A
version bump can rename them without counting as a breaking change — if classes
stop resolving in tests after an upgrade, look here first.

**`jest.mock()` factories cannot use a plain `require("react")`.** The interop's
Babel plugin rewrites `React.createElement` to reference a hoisted import, and
mock factories may not reference out-of-scope variables. Use
`jest.requireActual( "react" )` instead, or you get "module factory is not
allowed to reference out-of-scope variables".
