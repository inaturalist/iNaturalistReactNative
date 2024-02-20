// @flow

import { focusManager } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  AppState
} from "react-native";

const useReactQueryRefetch = ( ) => {
  // When the app is coming back from the background, set the focusManager to focused
  // This will trigger react-query to refetch any queries that are stale
  const onAppStateChange = status => {
    focusManager.setFocused( status === "active" );
  };

  useEffect( () => {
    // subscribe to app state changes
    const subscription = AppState.addEventListener( "change", onAppStateChange );

    // unsubscribe on unmount
    return ( ) => subscription?.remove();
  }, [] );
};

export default useReactQueryRefetch;
