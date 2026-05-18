import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): User | null => {
  const realm = useRealm( );
  const [currentUser, setCurrentUser] = useState<User | null>( null );

  useEffect( ( ) => {
    const realmResults = realm.objects( User ).filtered( "signedIn == true" );

    // when the signedIn User collection changes, update state to latest currentUser or null.
    // We don't need to handles changes in the listener because we only ever care about the
    // single result (or lack of)
    const listener = () => {
      setCurrentUser( User.currentUser( realm ) || null );
    };

    realmResults.addListener( listener );

    return ( ) => {
      realmResults.removeListener( listener );
    };
  }, [realm] );

  // isValid() here _only_ protects an invalid Realm being used in the one render pass between
  // the listener firing on logout and currentUser being setStat'd to null.
  // async callbacks referencing this `currentUser` return still need to `isValid()`.
  return currentUser?.isValid( )
    ? currentUser
    : null;
};

export default useCurrentUser;
