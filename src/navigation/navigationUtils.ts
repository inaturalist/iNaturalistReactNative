import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "navigation/types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Returns current active route
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    // Get the root navigator state
    const rootState = navigationRef.getRootState();

    // Find the active route in the navigation state
    let route = rootState.routes[rootState.index];
    while (route.state && route.state.routes) {
      route = route.state.routes[route.state.index];
    }

    return route;
  }

  return null;
}
