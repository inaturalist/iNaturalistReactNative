import { useNetInfo } from "@react-native-community/netinfo";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useSyncJoinedProjects = ( ) => {
  const realm = useRealm( );

  const currentUser = useCurrentUser( );

  const { isConnected } = useNetInfo( );

  useEffect( ( ) => {
    // only sync once we know we're online (matches iOS Legacy chooser behavior)
    if ( !currentUser?.id || isConnected !== true ) {
      return;
    }
    syncJoinedProjects( realm, currentUser.id );
  }, [currentUser?.id, realm, isConnected] );
};

export default useSyncJoinedProjects;
