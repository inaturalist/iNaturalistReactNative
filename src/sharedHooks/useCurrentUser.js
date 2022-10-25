import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";

const { useRealm } = RealmContext;

const useCurrentUser = ( ) => {
  const [currentUser, setCurrentUser] = useState( null );
  const realm = useRealm( );

  useEffect( ( ) => {
    const signedInUsers = realm.objects( "User" ).filtered( "signedIn == true" );
    if ( signedInUsers.length > 0 ) {
      setCurrentUser( signedInUsers[0] );
    } else {
      setCurrentUser( null );
    }
  }, [realm] );

  return currentUser;
};

export default useCurrentUser;
