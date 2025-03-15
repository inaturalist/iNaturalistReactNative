import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { signOut } from "components/LoginSignUp/AuthenticationService.ts";
import { RealmContext } from "providers/contexts.ts";
import { useEffect } from "react";
import { LogBox } from "react-native";
import DeviceInfo from "react-native-device-info";
import { MMKV } from "react-native-mmkv";
import Orientation from "react-native-orientation-locker";
import Realm from "realm";
import clearCaches from "sharedHelpers/clearCaches.ts";
import { log } from "sharedHelpers/logger";
import { addARCameraFiles } from "sharedHelpers/mlModel.ts";
import { findAndLogSentinelFiles } from "sharedHelpers/sentinelFiles.ts";
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

// it's not recommended to have multiple instances of MMKV in an app, but
// we can't use the zustand one here since it hasn't been initialized yet,
// and I don't think we can move storage creation into App.js without creating
// a dependency cycle
const installStatus = new MMKV( {
  id: "install-status"
} );

const INSTALL_STATUS = "alreadyLaunched";

const isTablet = DeviceInfo.isTablet( );

const { useRealm } = RealmContext;

const logger = log.extend( "StartupService" );

const geolocationConfig = {
  skipPermissionRequests: true
};

const StartupService = ( ) => {
  const realm = useRealm( );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0]?.isValid( );
  const { loadTime } = usePerformance( {
    screenName: "StartupService"
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
        const alreadyLaunched = installStatus.getBoolean( INSTALL_STATUS );
        if ( !alreadyLaunched ) {
          installStatus.set( INSTALL_STATUS, true );
          if ( !currentUser ) {
            await signOut( { clearRealm: true } );
          }
        }
      };
      // don't remove this logger.info statement: it's used for internal metrics
      logger.info( "pickup" );

      const checkForPreviousCrash = async ( ) => {
        try {
          const crashData = zustandStorage.getItem( "LAST_CRASH_DATA" );
          if ( crashData ) {
            logger.error( `Last Crash Data: ${JSON.parse( crashData )}` );
            zustandStorage.removeItem( "LAST_CRASH_DATA" );
          }
        } catch ( e ) {
          logger.error( "Failed to process previous crash data", e );
        }
      };

      try {
        await checkForSignedInUser( );
        await checkForPreviousCrash( );

        await addARCameraFiles( );
        await findAndLogSentinelFiles( );

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
