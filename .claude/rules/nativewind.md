---
paths:
  - "**/src/components/**"
  - "**/src/navigation/**"
  - "**/src/appConstants/**"
---

# NativeWind and component style

Why each of these fails, with the diagnostic table:
`agent-docs/conventions/nativewind-v4.md`. Component and accessibility conventions:
`agent-docs/conventions/component-conventions.md`.

## NativeWind v4 silently drops styles

Every item here compiles to nothing and warns about nothing. Assume a style has no effect
until you have seen it render.

- **A `className` on an unregistered component is ignored.** Only core RN components are
  registered automatically. Import third-party visual components from
  `components/styledComponents` instead of the raw package, and register a new one there with
  `cssInterop` before you rely on `className`.
- **Never build a class name from a template literal** — `` `h-[${DIM}px]` `` produces zero
  CSS, because Tailwind scans raw source text and never evaluates JS. Write the literal
  (`"h-10"`, or `"h-[40px]"`), or use `style` when the value is genuinely dynamic.
- **Merge conflicting classes with `twMerge`, not `classnames()`.** A plain merge resolves by
  stylesheet order, so a caller's override loses to a component's own default.
- **Prefer a conditional class over an unconditional base class plus an override** of the same
  property — the override may not win.
- **An inline `style` always beats a `className`** for the same property. Omit a style key
  rather than setting it to `undefined`.
- **`space-x-*` / `space-y-*` no longer exist.** Use `gap-x-*` / `gap-y-*`.
- `inlineRem: 16` must stay identical in `metro.config.js` and `tests/nativewind.setup.js`.

## Components

- Arrow functions: `const MyComponent = () => { };`. Props are `interface Props { ... }`
  declared directly above the component.
- Prefer NativeWind over `StyleSheet.create()` in new code, even next to legacy styles.
- Write `accessibilityHint` in third person singular, ending with a period: "Opens the
  camera." Set an `accessibilityRole` that matches what the element does.
