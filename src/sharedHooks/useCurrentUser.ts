import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import Realm from "realm";
import type { RealmUser } from "realmModels/types";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): RealmUser | null => {
  const realm = useRealm( );
  const [currentUser, setCurrentUser] = useState<RealmUser | null>( null );
  useEffect( ( ) => {
    const realmResults = realm.objects( "User" ).filtered( "signedIn == true" );

    // Sets the current user if one is detected, unsets it if not
    const listener = (
      collection: [Realm.Object<RealmUser>],
      changes: Realm.CollectionChangeSet
    ) => {
      if (
        ( changes.deletions && changes.deletions.length > 0 )
        || !collection[0]?.isValid( )
      ) {
        setCurrentUser( null );
      } else {
        setCurrentUser( collection[0] );
      }
    };

    // Run the listener on the results for the first time
    listener( realmResults, {} );

    // Add the listener
    realmResults?.addListener( listener );

    // Remove the listener when this dismounts
    return ( ) => {
      realmResults?.removeListener( listener );
    };
  }, [realm] );

  return currentUser?.isValid( )
    ? currentUser
    : null;
};

export default useCurrentUser;
