import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import User from "realmModels/User.ts";

const { useRealm } = RealmContext;

const useCurrentUser = (): object | null => {
  const realm = useRealm();
  const [currentUser, setCurrentUser] = useState<User | null>( null );

  useEffect( () => {
    const users = realm.objects( "User" ).filtered( "signedIn == true" );

    // Initial setting
    setCurrentUser( users[0] ?? null );

    // Listener for changes in the query results
    const listener = () => {
      setCurrentUser( users[0] ?? null );
    };

    users.addListener( listener );

    // Cleanup listener when component unmounts or realm changes
    return () => {
      if ( users.isValid() ) {
        users.removeListener( listener );
      }
    };
  }, [realm] );

  return currentUser && currentUser.isValid()
    ? currentUser.toJSON()
    : null;
};

export default useCurrentUser;
