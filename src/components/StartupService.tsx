import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import { LogBox } from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import Realm from "realm";
import clearCaches from "sharedHelpers/clearCaches";
import { IS_FRESH_INSTALL, store } from "sharedHelpers/installData";
import { log } from "sharedHelpers/logger";
import { addARCameraFiles } from "sharedHelpers/mlModel";
import { findAndLogSentinelFiles } from "sharedHelpers/sentinelFiles";
import {
  usePerformance
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import { zustandStorage } from "stores/useStore";

// Ignore warnings about 3rd parties that haven't implemented the new
// NativeEventEmitter interface methods yet. As of 20230517, this is coming
// from react-native-share-menu.
// https://stackoverflow.com/questions/69538962
LogBox.ignoreLogs( ["new NativeEventEmitter"] );

Realm.setLogLevel( "warn" );

// better to ping our own website to check for site uptime
// with no rendering required, per issue #1770
NetInfo.configure( {
  reachabilityUrl: "https://www.inaturalist.org/ping"
} );

const isTablet = DeviceInfo.isTablet( );

const { useRealm } = RealmContext;

const logger = log.extend( "StartupService" );

const geolocationConfig = {
  skipPermissionRequests: true
};

const checkForPreviousCrash = async ( ) => {
  try {
    const crashData = zustandStorage.getItem( "LAST_CRASH_DATA" );
    if ( crashData ) {
      const parsedData = JSON.parse( crashData.toString( ) );
      logger.error( "Last Crash Data:", JSON.stringify( parsedData ) );
      zustandStorage.removeItem( "LAST_CRASH_DATA" );
    }
  } catch ( e ) {
    logger.error( "Failed to process previous crash data", e );
  }
};

const StartupService = ( ) => {
  const realm = useRealm( );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0]?.isValid( );
  const { loadTime } = usePerformance( {
    screenName: "StartupService",
    isLoading: false
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  useEffect( ( ) => {
    const initializeApp = async ( ) => {
      const checkForSignedInUser = async ( ) => {
        // check to see if this is a fresh install of the app
        // if it is, delete realm file when we sign the user out of the app
        // this handles the case where a user deletes the app, then reinstalls
        // and expects to be signed out with no previously saved data
        const isFreshInstall = store.getBoolean( IS_FRESH_INSTALL );
        if ( isFreshInstall ) {
          store.set( IS_FRESH_INSTALL, false );
          if ( !currentUser ) {
            await signOut( { clearRealm: true } );
          }
        } else {
          // make sure the MMKV store has been created on a previous installation
          // before trying to query it
          // though we really should only have one store
          await checkForPreviousCrash( );
          // also don't bother looking for sentinel files if user has a fresh installation
          await findAndLogSentinelFiles( );
        }
      };
      // don't remove this logger.info statement: it's used for internal metrics
      logger.info( "pickup" );
      logger.info(
        `App version: ${DeviceInfo.getVersion()}, build: ${DeviceInfo.getBuildNumber()}`
      );

      try {
        await checkForSignedInUser( );
        await addARCameraFiles( );

        // this ensures that React Query has the most accurate depiction of whether the
        // app is online or offline. since queries only run when the app is online, this
        // eventListener prevents both queries and retries (via reactQueryRetry)
        // from running unnecessarily when the app is offline
        // https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
        onlineManager.setEventListener( setOnline => NetInfo.addEventListener( state => {
          setOnline( !!state.isConnected );
        } ) );

        // skipping location permissions here since we're manually showing
        // permission gates and don't want to pop up the native notification
        Geolocation.setRNConfiguration( geolocationConfig );

        if ( !isTablet ) {
          Orientation.lockToPortrait( );
        }
        // Run startup tasks when app launches
        if ( realm?.path ) {
          await clearCaches( isDebugMode( ), realm );
        }
      } catch ( error ) {
        logger.error( "Startup service error:", error );
      }
    };

    initializeApp( );
  }, [realm, currentUser] );

  return null;
};

export default StartupService;
