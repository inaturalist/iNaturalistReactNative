# Internationalization Conventions

Rules version: `.claude/rules/i18n.md`. This doc is the Fluent syntax reference.

Source strings are Fluent (`src/i18n/strings.ftl`), consumed through i18next.
`npm run translate` compiles them to the JSON i18next actually loads. Full
Fluent guide: https://projectfluent.org/fluent/guide/

## Basic use

```javascript
import { useTranslation } from "sharedHooks";

const { t } = useTranslation();
return <Text>{t( "my-string-key" )}</Text>;
```

## Variables

```ftl
welcome-message = Welcome, { $username }!
```
```javascript
t( "welcome-message", { username: user.login } )
```

Prefer separate strings over a variable where the set of values is small and
known. A variable hides grammatical agreement that many languages need — the
translator cannot tell whether `{ $username }` is a subject or an object.

## JSX interpolation

A string containing markup needs the `<Trans>` component. Passing a React
element through `t()` renders it as a string.

## Pluralization

Fluent selectors, never string concatenation — the `[one]`/`*[other]` split is
what lets a locale with three or six plural forms add its own branches:

```ftl
observation-count = { $count } { $count ->
    [one] observation
   *[other] observations
}
```

## Why the key rules exist

The full list is in the rule; the reasoning is that `strings.ftl` keys are the
join key against 40 locale files maintained by volunteers in Crowdin. Reusing a
key for new content does not invalidate the old translations, so every locale
silently keeps displaying the previous wording. Nothing in the build catches it.
Double-dash disambiguation (`Unknown--rank`, `Unknown--taxon`) exists because
translators see the key and the English string, not the screen — one English
word often needs different words per context.
