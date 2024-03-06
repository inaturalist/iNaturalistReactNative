// @flow
import { RealmContext } from "providers/contexts";
import { useEffect, useRef, useState } from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useCacheBust,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "useBustUserIconCache" );

const useBustUserIconCache = ( ): Object => {
  // use this ref to make sure cache is only busted once per app open
  const calledOncePerAppLoad = useRef( false );
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const IMAGE_URL = currentUser?.icon_url;
  const { url: uri, bust } = useCacheBust( IMAGE_URL );

  const [prevUri, setPrevUri] = useState( null );

  const skipCacheBust = !currentUser || prevUri || calledOncePerAppLoad.current;

  useEffect( ( ) => {
    if ( skipCacheBust ) { return; }
    setPrevUri( uri );
    calledOncePerAppLoad.current = true;
    logger.info( "Busting cache for user icon in useBustUserIconCache" );
    bust( );
  }, [skipCacheBust, uri, bust] );

  useEffect( ( ) => {
    if ( !currentUser ) { return; }
    if ( uri !== currentUser.cached_icon_url && prevUri ) {
      safeRealmWrite( realm, ( ) => {
        currentUser.cached_icon_url = uri;
      }, "updating cached_icon_url in useBustUserIconCache" );
    }
  }, [uri, currentUser, realm, prevUri] );

  return null;
};

export default useBustUserIconCache;
