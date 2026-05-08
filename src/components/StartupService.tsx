import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { getUserAgent } from "api/userAgent";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import Realm from "realm";
import { IS_FRESH_INSTALL, store } from "sharedHelpers/installData";
import { log } from "sharedHelpers/logger";
import { addARCameraFiles } from "sharedHelpers/mlModel";
import { usePerformance } from "sharedHooks";
import useDebugMode from "sharedHooks/useDebugMode";

Realm.setLogLevel( "warn" );

// better to ping our own website to check for site uptime
// with no rendering required, per issue #1770
NetInfo.configure( {
  reachabilityUrl: "https://www.inaturalist.org/ping",
  reachabilityHeaders: {
    "User-Agent": getUserAgent( ),
  },
} );

const isTablet = DeviceInfo.isTablet( );

const { useRealm } = RealmContext;

const logger = log.extend( "StartupService" );

const geolocationConfig = {
  skipPermissionRequests: true,
};

const StartupService = ( ) => {
  const realm = useRealm( );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0]?.isValid( );
  const { loadTime } = usePerformance( {
    screenName: "StartupService",
    isLoading: false,
  } );
  const { isDebug } = useDebugMode();
  useEffect( () => {
    if ( isDebug && loadTime ) {
      logger.info( loadTime );
    }
  }, [isDebug, loadTime] );

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
            await signOut( { realm, clearRealm: true } );
          }
        }
      };
      // don't remove this logger.info statement: it's used for internal metrics
      logger.info( "pickup" );
      logger.info(
        `App version: ${DeviceInfo.getVersion()}, build: ${DeviceInfo.getBuildNumber()}`,
      );

      try {
        await checkForSignedInUser( );
        // TODO: this sounds like something we should move to DeferredStartupService,
        // but we do need these files for the CV camera to work. So, for the subset of user that
        // open the app straight to camera we need to test that doing this deferred does not impact
        // the TTId (Time-To-Identification)
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
      } catch ( error ) {
        logger.error( "Startup service error:", error );
      }
    };

    initializeApp( );
  }, [realm, currentUser] );

  return null;
};

export default StartupService;
