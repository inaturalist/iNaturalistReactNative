# Module Import Aliases

Babel module resolver provides import aliases defined in `babel.config.js`. Using relative paths is blocked by the `module-resolver/use-alias` ESLint rule.

## Available Aliases

| Alias | Path | Purpose |
|-------|------|---------|
| `api` | `src/api/` | API wrapper functions |
| `appConstants` | `src/appConstants/` | App-wide constants |
| `components` | `src/components/` | React components by feature |
| `dictionaries` | `src/dictionaries/` | Static data dictionaries |
| `i18n` | `src/i18n/` | Translation system |
| `images` | `src/images/` | Image and icon assets |
| `navigation` | `src/navigation/` | React Navigation config |
| `providers` | `src/providers/` | React context providers |
| `realmModels` | `src/realmModels/` | Realm database schemas |
| `sharedHelpers` | `src/sharedHelpers/` | Pure utility functions |
| `sharedHooks` | `src/sharedHooks/` | Reusable React hooks |
| `stores` | `src/stores/` | Zustand store slices |
| `styles` | `src/styles/` | Shared styles |
| `tests` | `tests/` | Test utilities and factories |
| `uploaders` | `src/uploaders/` | Upload system |

## Usage Examples

```javascript
// Components
import ObsEdit from "components/ObsEdit/ObsEdit";

// Hooks
import { useCurrentUser } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

// Helpers
import { formatApiDatetime } from "sharedHelpers/dateAndTime";

// Models
import Observation from "realmModels/Observation";

// API
import { searchObservations } from "api/observations";

// Stores
import useStore from "stores/useStore";

// Test utilities
import factory from "tests/factory";
```
