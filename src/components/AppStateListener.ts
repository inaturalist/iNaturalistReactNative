import { focusManager } from "@tanstack/react-query";
import useDeviceStorageFull from "components/Camera/hooks/useDeviceStorageFull";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { log } from "sharedHelpers/logger";
import {
  usePerformance
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "AppStateListener" );

const AppStateListener = ( ) => {
  const { loadTime } = usePerformance( {
    screenName: "AppStateListener",
    isLoading: false
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }
  const { deviceStorageFull, showStorageFullAlert } = useDeviceStorageFull( );
  const [deviceStorageFullShown, setDeviceStorageFullShown] = useState( false );

  useEffect( ( ) => {
    const subscription = AppState.addEventListener( "change", nextAppState => {
      if ( nextAppState === "active" ) {
        // Check storage and show alert as needed when app becomes active
        if ( deviceStorageFull && !deviceStorageFullShown ) {
          showStorageFullAlert( );
          setDeviceStorageFullShown( true );
        }

        focusManager.setFocused( true );
      }
    } );

    return ( ) => subscription.remove( );
  }, [deviceStorageFull, deviceStorageFullShown, showStorageFullAlert] );

  return null;
};

export default AppStateListener;
