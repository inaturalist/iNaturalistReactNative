import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import syncJoinedProjects from "sharedHelpers/syncJoinedProjects";
import { useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const useSyncJoinedProjects = ( ) => {
  const realm = useRealm( );

  const currentUser = useCurrentUser( );

  useEffect( ( ) => {
    if ( !currentUser?.id ) {
      return;
    }
    syncJoinedProjects( realm, currentUser?.id );
  }, [currentUser?.id, realm] );
};

export default useSyncJoinedProjects;
