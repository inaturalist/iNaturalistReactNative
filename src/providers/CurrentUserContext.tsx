import isEqual from "lodash/isEqual";
import { RealmContext } from "providers/contexts";
import type { PropsWithChildren } from "react";
import * as React from "react";
import { useEffect } from "react";
import type { UserPojo } from "realmModels/User";
import User from "realmModels/User";

const { useRealm } = RealmContext;

const CurrentUserContext = React.createContext<UserPojo | null >(
  null,
);

export const CurrentUserProvider = ( {
  children,
}: PropsWithChildren ) => {
  const realm = useRealm( );

  const [currentUser, setCurrentUser] = React.useState<UserPojo | null>(
    ( ) => User.mapRealmToPojo( User.currentUser( realm ) ),
  );

  useEffect( ( ) => {
    try {
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
    } catch {
      return ( ) => { };
    }
  }, [realm] );

  return (
    <CurrentUserContext value={currentUser}>
      {children}
    </CurrentUserContext>
  );
};

export const useCurrentUserContext = ( ): UserPojo | null => {
  const context = React.useContext( CurrentUserContext );
  // Pattern from https://kentcdodds.com/blog/how-to-use-react-context-effectively
  if ( context === undefined ) {
    throw new Error( "useCurrentUserContext must be used within a CurrentUserProvider" );
  }
  return context;
};
