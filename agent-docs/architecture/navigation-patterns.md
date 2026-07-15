# Navigation Architecture

## Overview

React Navigation 7 with nested NativeStack and BottomTab navigators. All four bottom tabs share the same `TabStackNavigator` component with different `initialRouteName` values. `SharedStackScreens` provides screens accessible from both tab and full-screen contexts.

## Navigator Hierarchy

```
RootStackNavigator (NativeStack)
├── OnboardingStackNavigator (rendered at root when !onboardingShown; replaces the tab navigator, not a modal over it)
├── BottomTabNavigator (shown when onboarded)
│   ├── MenuTab → TabStackNavigator (initialRouteName: Menu)
│   ├── ExploreTab → TabStackNavigator (initialRouteName: RootExplore)
│   ├── ObservationsTab → TabStackNavigator (initialRouteName: ObsList)
│   └── NotificationsTab → TabStackNavigator (initialRouteName: Notifications)
├── NoBottomTabStackNavigator (full-screen: Camera, PhotoLibrary, etc.)
└── LoginStackNavigator (Login, SignUp, ForgotPassword, etc.)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/navigation/RootStackNavigator.tsx` | Top-level navigator |
| `src/navigation/StackNavigators/TabStackNavigator.tsx` | Shared by all 4 bottom tabs |
| `src/navigation/StackNavigators/SharedStackScreens.tsx` | Screens in both tab and full-screen contexts |
| `src/navigation/StackNavigators/NoBottomTabStackNavigator.tsx` | Camera, PhotoLibrary, GroupPhotos, SoundRecorder |
| `src/navigation/StackNavigators/LoginStackNavigator.tsx` | Auth screens |
| `src/navigation/BottomTabNavigator/index.tsx` | Tab setup with CustomTabBarContainer |
| `src/navigation/navigationUtils.ts` | Global `navigationRef`, `getCurrentRoute()` |
| `src/navigation/navigationOptions.tsx` | Header presets: hideHeader, showHeader, fadeInComponent, etc. |
| `src/navigation/OfflineNavigationGuard.tsx` | NavigationContainer with offline guard + analytics |
| `src/navigation/ContextHeader.js` | Custom header for list screens |
| `src/components/hooks/useLinking.ts` | Deep linking (manual Linking API) |

## Where to Add a Screen

| Scenario | Navigator | Tabs Visible? |
|----------|-----------|---------------|
| Standard screen accessible from any tab | `SharedStackScreens` | Yes |
| Full-screen flow (camera, media capture) | `NoBottomTabStackNavigator` | No |
| Tab-specific screen | `TabStackNavigator` (directly) | Yes |
| Auth screen | `LoginStackNavigator` | No |

## SharedStackScreens (Registered in Both Contexts)

Screens available from TabStackNavigator AND NoBottomTabStackNavigator:
- **Hidden header**: ObsEdit, LocationPicker, TaxonDetails, PhotoSharing
- **Centered header**: Match, Suggestions, SuggestionsTaxonSearch, MatchTaxonSearchScreen, AddToProjects
- **Custom header**: FullPageWebView

All wrapped with `fadeInComponent()` for fade-in animation.

## Navigation Patterns

### Navigating to a tab screen
```javascript
navigation.navigate( "TabNavigator", {
  screen: "ObservationsTab",
  params: { screen: "ObsList" },
} );
```

### Deep navigation with reset (e.g., navigateToObsDetails)
```javascript
navigation.dispatch(
  CommonActions.reset( {
    index: 1,
    routes: [ {
      name: "TabNavigator",
      state: {
        routes: [ {
          name: "ObservationsTab",
          state: {
            index: 0,
            routes: [
              { name: "ObsList" },
              { name: "ObsDetails", params: { uuid } },
            ],
          },
        } ],
      },
    } ],
  } )
);
```

### Reading params
```javascript
const { params } = useRoute();
const { lastScreen, uuid } = params || {};
```

## Key Design Patterns

1. **Tab Stack Reuse** — Same TabStackNavigator instantiated 4 times with different initialRouteName. Each tab maintains independent navigation history.

2. **Shared Screen Accessibility** — SharedStackScreens Group in both tab and full-screen navigators enables flows like: Camera (NoBottomTab) → Match (Shared) → ObsEdit (Shared) → ObsList (Tab).

3. **Back Navigation Fallback** — Custom headers check `navigation.canGoBack()`. If no history, default to TabNavigator → ObservationsTab → ObsList.

4. **Tab State Preservation** — `freezeOnBlur: true` suspends inactive tabs. `backBehavior: "history"` preserves per-tab stacks.

5. **Animation Workaround** — `fadeInComponent()` wraps individual screens for a fade-in effect. This is the current workaround; the React Navigation 7 `layout` prop is expected to replace these per-screen wrappers (see the comments in `TabStackNavigator.tsx` / `SharedStackScreens.tsx`).

## Deep Linking

Manual implementation via React Native's `Linking` API (no React Navigation linking config):
- Allowed host: `www.inaturalist.org` only
- `/observations/{id}` → ObsDetails screen
- Email confirmed URLs → LoginStackNavigator with `emailConfirmed: true`
- Fetches observation data from API before navigating

## Typical Flow: Creating an Observation

1. Camera button → NoBottomTabStackNavigator → Camera
2. Photo selected → GroupPhotos (still NoBottomTab)
3. ID flow → Match or Suggestions (SharedStackScreens)
4. Edit → ObsEdit (SharedStackScreens)
5. Save → Navigate to TabNavigator → ObservationsTab → ObsList
