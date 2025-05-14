import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

// Returns current active route
export function getCurrentRoute() {
  if ( navigationRef.isReady() ) {
    // Get the root navigator state
    const rootState = navigationRef.getRootState();

    // Find the active route in the navigation state
    let route = rootState.routes[rootState.index];
    while ( route.state && route.state.routes ) {
      route = route.state.routes[route.state.index];
    }

    return route;
  }

  return null;
}

const navigate = ( name, params ) => {
  navigationRef.current?.navigate( name, params );
};

const navigateToTabStack = ( screenName, params = {} ) => {
  navigate( "TabNavigator", {
    screen: "TabStackNavigator",
    params: {
      screen: screenName,
      params
    }
  } );
};

export {
  navigateToTabStack
};
