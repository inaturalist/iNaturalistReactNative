# Navigation Architecture

React Navigation 7, nested NativeStack inside BottomTab. Read
`src/navigation/RootStackNavigator.tsx` for the current tree; this doc covers
the decisions the tree does not explain.

## Where a new screen goes

| Scenario | Navigator | Tabs visible? |
|----------|-----------|---------------|
| Standard screen reachable from any tab | `SharedStackScreens` | Yes |
| Full-screen flow (camera, media capture) | `NoBottomTabStackNavigator` | No |
| Screen belonging to one tab | `TabStackNavigator` | Yes |
| Auth screen | `LoginStackNavigator` | No |

## Why it is shaped this way

1. **All four bottom tabs render the same `TabStackNavigator`** with different
   `initialRouteName` values, so every tab has the whole screen catalog and its
   own independent history.
2. **`SharedStackScreens` is a `Stack.Group` registered in both**
   `TabStackNavigator` and `NoBottomTabStackNavigator`. That is what lets a flow
   cross contexts: Camera (no tabs) → Match (shared) → ObsEdit (shared) →
   ObsList (tab).
3. **Custom headers check `navigation.canGoBack()`** and fall back to
   TabNavigator → ObservationsTab → ObsList when there is no history. A screen
   entered by a deep link or a reset has none.
4. **`freezeOnBlur: true`** suspends inactive tabs and `backBehavior: "history"`
   preserves per-tab stacks. Neither survives the tab-tree teardown described in
   `realm-and-zustand.md` — freezing is not the same as staying mounted.
5. **`fadeInComponent()` wrapping individual screens is a workaround** for
   per-screen fade-in. React Navigation 7's `layout` prop is expected to replace
   it; see the comments in `TabStackNavigator.tsx` and `SharedStackScreens.tsx`
   before adding another wrapper.
6. **`TabNavigator` stays registered during onboarding.** `OnboardingStackNavigator`
   is registered first, as the initial route, only while `!onboardingShown`. The
   carousel exits by resetting the root to `TabNavigator` with Login on top, and
   React Navigation drops a reset that names an unregistered route. So any
   root-level reset to `TabNavigator` during onboarding removes the carousel
   without setting `onboardingShown`, and it returns on next launch.

## Deep linking is hand-rolled

There is no React Navigation `linking` config. `src/components/hooks/useLinking.ts`
uses React Native's `Linking` API directly:

- `www.inaturalist.org` is the only allowed host.
- `/observations/{id}` resolves to ObsDetails, fetching the observation from the
  API *before* navigating. It is deliberately not deferred during onboarding, so
  it hits the reset described in point 6.
- Email-confirmation URLs go to `LoginStackNavigator` with `emailConfirmed: true`.

Adding a route means editing that hook, not a config object.
