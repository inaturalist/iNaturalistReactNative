import {
  useNetInfo
} from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { Alert } from "react-native";
import { useTranslation } from "sharedHooks";

import { navigationRef } from "./navigationUtils";

interface Props {
  children: React.JSX.Element
}

const OfflineNavigationGuard = ( { children }: Props ) => {
  const { isConnected } = useNetInfo( );
  const { t } = useTranslation( );

  // if a user tries to navigate to the Login screen while they're
  // offline, they'll see this no internet alert and automatically land
  // back on the screen they came from
  const onStateChange = ( ) => {
    const currentRoute = navigationRef.current?.getCurrentRoute( );
    if ( currentRoute?.name === "Login" && !isConnected ) {
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
      onStateChange={onStateChange}
    >
      {children}
    </NavigationContainer>
  );
};

export default OfflineNavigationGuard;
