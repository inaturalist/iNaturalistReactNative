import isEqual from "lodash/isEqual";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import type { UserPojo } from "realmModels/User";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const useCurrentUser = ( ): UserPojo | null => {
  const realm = useRealm( );

  const [currentUser, setCurrentUser] = useState<UserPojo | null>(
    () => User.mapRealmToPojo( User.currentUser( realm ) ),
  );

  useEffect( ( ) => {
    const realmResults = realm.objects( User ).filtered( "signedIn == true" );

    // when the signedIn User collection changes, get a new snapshot
    const listener = ( ) => {
      const next = User.mapRealmToPojo( User.currentUser( realm ) );
      setCurrentUser( prev => (
        isEqual( prev, next )
          ? prev
          : next
      ) );
    };

    // User could* have been mutated between state initialization and listener setup, resync state
    // * FLGMwt: if you're reading this and have better knowledge of Realm's lifecycle, speak up!
    listener();

    realmResults.addListener( listener );
    return ( ) => {
      realmResults.removeListener( listener );
    };
  }, [realm] );

  return currentUser;
};

export default useCurrentUser;
