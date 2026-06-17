# Internationalization (i18n) Conventions

## System Overview
- Translation system: Fluent → i18next
- Source strings: `src/i18n/strings.ftl` (US English only — this is the only file to edit)
- Translations: `src/i18n/l10n/` (pulled from Crowdin — NEVER edit directly)
- Fluent syntax reference: https://projectfluent.org/fluent/guide/

## Usage in Components

### Basic Translation
```javascript
import { useTranslation } from "sharedHooks";

const MyComponent = () => {
  const { t } = useTranslation();
  return <Text>{t( "my-string-key" )}</Text>;
};
```

### With Variables
```ftl
# In strings.ftl
welcome-message = Welcome, { $username }!
```
```javascript
t( "welcome-message", { username: user.login } )
```

### With JSX Interpolation
Use `<Trans>` component for strings containing JSX elements.

### Pluralization
```ftl
# In strings.ftl
observation-count = { $count } { $count ->
    [one] observation
   *[other] observations
}
```

## String Key Naming Rules

1. **Labels match content** — max 100 characters for the key
2. **Change key when content changes** — don't reuse keys for different meanings
3. **Add comments** for translator context (unless self-explanatory)
4. **Double-dashes for disambiguation** — `Unknown--place`, `Unknown--taxon`
5. **Avoid variables when possible** — create separate strings for each case
6. **Kebab-case** for key names

## Adding New Strings

1. Add the string to `src/i18n/strings.ftl`
2. Run `npm run translate` to validate and build JSON
3. Use `t( "your-key" )` in the component
4. The ESLint i18next string literal rule will catch any user-facing text not using `t()`

## Common Mistakes

- Editing files in `src/i18n/l10n/` — these are auto-generated from Crowdin
- Forgetting to run `npm run translate` after editing `strings.ftl`
- Using template literals for user-facing text instead of `t()`
- Reusing an existing key for a different meaning
