// @flow
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useCacheBust,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "useBustUserIconCache" );

const useBustUserIconCache = ( remoteUserUpdated: boolean ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const IMAGE_URL = currentUser?.cached_icon_url || currentUser?.icon_url;

  const { url: uri, bust } = useCacheBust( IMAGE_URL );

  useEffect( ( ) => {
    if ( !remoteUserUpdated ) { return; }
    logger.info( "Busting cache for user icon in useBustUserIconCache" );
    bust( );
  }, [bust, remoteUserUpdated] );

  useEffect( ( ) => {
    if ( uri ) {
      safeRealmWrite( realm, ( ) => {
        realm.create( "User", {
          ...currentUser,
          cached_icon_url: uri
        }, "modified" );
      }, "updating cached_icon_url in useBustUserIconCache" );
    }
  }, [uri, currentUser, realm] );

  return null;
};

export default useBustUserIconCache;
