# Component Conventions

## Styling
- **NativeWind** (Tailwind CSS for React Native) is the primary styling system
- Use Tailwind utility classes via the `className` prop
- Custom config: `tailwind.config.js`
- Some legacy components use `StyleSheet.create()` — prefer NativeWind for new code
- **React Native Paper** is used for some Material Design components

## Component Structure
- Arrow functions for React components: `const MyComponent = () => { };`
- Components organized by feature in `src/components/` (Camera, Explore, MyObservations, etc.)

## Accessibility
- `eslint-plugin-react-native-a11y` enforces accessibility rules
- All interactive elements need `accessibilityLabel`
- Use `accessibilityHint` for non-obvious actions
- Hints in third person singular ending with period: "Opens the camera."
- Set appropriate `accessibilityRole` (button, link, image, etc.)
- Test with VoiceOver (iOS) and TalkBack (Android)

## Translations (i18n)
- Use `useTranslation()` hook: `const { t } = useTranslation();`
- ALL user-facing text must use `t()` — enforced by ESLint
- For complex interpolation with JSX, use `<Trans>` component
- Source strings go in `src/i18n/strings.ftl` (US English only)
- Run `npm run translate` after modifying `strings.ftl`

### String Naming Rules
- Labels should match content (max 100 chars)
- Change label when content changes (don't reuse keys for different meanings)
- Add comments for context unless self-explanatory
- Use double-dashes for disambiguation: `Unknown--rank`, `Unknown--taxon`
- Avoid variables when possible — create separate strings for each case
- Plurals use selectors: `{ $count } { $count -> [one] observation *[other] observations }`

## Imports
- MUST use module aliases (enforced by `module-resolver/use-alias` ESLint rule)
- Available aliases: `api`, `appConstants`, `components`, `dictionaries`, `i18n`, `images`, `navigation`, `providers`, `realmModels`, `sharedHelpers`, `sharedHooks`, `stores`, `styles`, `tests`, `uploaders`
- Defined in `babel.config.js`

```javascript
// CORRECT
import Component from "components/MyComponent";
import { useObservation } from "sharedHooks";

// WRONG - never use deep relative paths
import Component from "../../../components/MyComponent";
```

## Code Style
- Double quotes for strings
- Spaces inside parentheses: `if ( condition ) { }`
- Max line length: 100 characters
- No console statements in production (removed via Babel plugin)
- ESLint config extends Airbnb with custom rules (`.eslintrc.js`)
- Pre-commit hooks run `eslint --fix` via Husky
