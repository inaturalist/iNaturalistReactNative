import { useNetInfo } from "@react-native-community/netinfo";
import { RealmContext } from "providers/contexts";
import { useEffect, useRef } from "react";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useSyncJoinedProjects = ( ) => {
  const realm = useRealm( );

  const currentUser = useCurrentUser( );

  const { isConnected } = useNetInfo( );

  // Sync at most once per mount so connectivity flapping while the screen
  // is open can't refire it
  const hasSynced = useRef( false );

  useEffect( ( ) => {
    // only sync once we know we're online (matches iOS Legacy chooser behavior)
    if ( hasSynced.current || !currentUser?.id || isConnected !== true ) {
      return;
    }
    hasSynced.current = true;
    syncJoinedProjects( realm, currentUser.id );
  }, [currentUser?.id, realm, isConnected] );
};

export default useSyncJoinedProjects;
