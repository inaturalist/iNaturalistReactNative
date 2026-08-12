# TypeScript Conventions

## Partial adoption

The codebase is **partway through a Flow → TypeScript migration** and both coexist:

- New files should prefer `.ts` / `.tsx`.
- Many existing files are still `.js` with Flow type annotations. **Do not strip Flow types from a file you aren't actively migrating** — leave them until the file is converted wholesale.
- There is a large pre-existing `tsc` error baseline (see the `lint:tsc` note in `AGENTS.md`). The bar is "add no new errors in files you touch," not "zero errors."

## Type checkers

| Command | Checks |
|---------|--------|
| `npm run lint:tsc` | TypeScript (`tsconfig.json`) |
| `npm run lint:flow` | Flow (`.js` files with `// @flow`) |

## Honest types

**If a `tsc` error is a legitimate type mismatch you can't fix within the scope of your change, leave it reported.** A visible error is an honest TODO; a cast is a lie that survives the migration. The baseline is the record — reviewers diff `lint:tsc` before and after to see what a change cost.

When you *can* fix an error in scope, fix the producer, not the call site — type the Realm query (`realm.objects<RealmTaxon>( "Taxon" )`) rather than casting its result. Defer when the root is somewhere your change doesn't reach; that's its own PR.

**Converting `.js` → `.ts`/`.tsx`:** `lint:tsc` runs with `--allowJs false`, so Flow `.js` files aren't checked at all. Converting one adds it to the program for the first time and pre-existing mismatches surface as new errors. Expected — fix the ones your change is about, especially in files it already touches, and leave the rest visible.

## `interface` vs `type`

- Use **`interface`** for object shapes — component props, data models, API response objects, state objects, hook return values. Props are declared as `interface Props { ... }` directly above the component.
- Use **`type`** only for unions, string-literal types, aliases, and intersections.

```typescript
interface Props {
  taxon: Taxon;
  onPress: ( id: number ) => void;
}

type ScreenAfterPhotoEvidence = "Match" | "Suggestions" | "ObsEdit";
```

## Other guidance

- Prefer type **inference** over redundant annotations; annotate at boundaries (params, returns, exported values).
- Avoid `any`; reach for `unknown` when a value is genuinely untyped, then narrow. TS7016 implicit-`any` from importing untyped `.js` modules is part of the accepted baseline — leave it alone (see [Honest types](#honest-types)).
- **Realm** models use their own class-based `ObjectSchema` type system rather than plain interfaces.
- **Navigation** params are typed via the param-list types (`RootStackParamList`, etc.) — see `agent-docs/architecture/navigation-patterns.md`.
