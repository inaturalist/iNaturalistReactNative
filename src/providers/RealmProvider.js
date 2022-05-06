// @flow
import React, { useEffect, useState } from "react";
import Realm from "realm";
import type { Node } from "react";

import { RealmContext } from "./contexts";
import realmConfig from "../models/realmConfig";

type Props = {
  children: any
}

/**
 * Provides a single Realm instance to the entire app so no other code needs
 * to worry about opening Realm
 */
const RealmProvider = ( { children }: Props ): Node => {
  const [realm, setRealm] = useState( null );
  useEffect( ( ) => {
    if ( !realm || realm.isClosed ) {
      // kueda: IMO this is just more concise than async / await here
      Realm.open( realmConfig )
        .then( setRealm )
        .catch( e => {
          console.log( "[DEBUG] Failed to init realm: ", e );
        } );
    }
  }, [realm, setRealm] );

  // This effect should only run when the component unmounts, and should not
  // depend on changes to realm
  useEffect( ( ) => ( ) => {
    console.log( "[DEBUG] RealmProvider is unmounting, closing realm" );
    realm?.close( );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  return (
    <RealmContext.Provider value={realm}>
      {children}
    </RealmContext.Provider>
  );
};

export default RealmProvider;
