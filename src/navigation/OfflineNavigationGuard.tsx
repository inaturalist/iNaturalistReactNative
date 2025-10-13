import {
  useNetInfo
} from "@react-native-community/netinfo";
import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
import { NavigationContainer } from "@react-navigation/native";
import React, { PropsWithChildren, useRef } from "react";
import { Alert } from "react-native";
import { useTranslation } from "sharedHooks";

import { navigationRef } from "./navigationUtils";

const OfflineNavigationGuard = ( { children }: PropsWithChildren ) => {
  const routeNameRef = useRef( navigationRef.current?.getCurrentRoute()?.name );
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );

  // if a user tries to navigate to the Login screen while they're
  // offline, they'll see this no internet alert and automatically land
  // back on the screen they came from
  const onStateChange = ( ) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute( )?.name;
    // Basic screen tracking with Firebase Analytics
    if ( previousRouteName !== currentRouteName ) {
      const analytics = getAnalytics();
      // @ts-expect-error https://github.com/invertase/react-native-firebase/pull/8687
      logEvent( analytics, "screen_view", {
        screen_name: currentRouteName,
        screen_class: currentRouteName
      } );
    }
    if ( currentRouteName === "Login" && !isConnected ) {
      // return to previous screen if offline
      navigationRef.current?.goBack( );
      if ( !isConnected ) {
        Alert.alert(
          t( "Internet-Connection-Required" ),
          t( "Please-try-again-when-you-are-connected-to-the-internet" )
        );
      }
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={onStateChange}
    >
      {children}
    </NavigationContainer>
  );
};

export default OfflineNavigationGuard;
