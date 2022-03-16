// @flow
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Node } from "react";
import Realm from "realm";

import realmConfig from "../models/index";
import { ObservationContext } from "./contexts";
import useObservations from "./hooks/useObservations";

type Props = {
  children: any
}

const ObservationProvider = ( { children }: Props ): Node => {
  const [observationList, setObservationList] = useState( [] );
  const [refetch, setRefetch] = useState( false );

  const syncObservations = ( ) => setRefetch( true );

  // TODO: put this fetch into either a sync button or a pull-from-top gesture
  // instead of automatically fetching every time ObsProvider loads
  // and add syncing logic to Realm schemas
  const loading = useObservations( refetch );

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    // Since this is a non-sync realm, realm will be opened synchronously when calling "Realm.open"
    const realm = await Realm.open( realmConfig );
    realmRef.current = realm;

    // When querying a realm to find objects (e.g. realm.objects('Observation')) the result we get back
    // and the objects in it are "live" and will always reflect the latest state.
    const localObservations = realm.objects( "Observation" );

    if ( localObservations?.length ) {
      setObservationList( localObservations );
    }

    try {
      localObservations.addListener( ( ) => {
        // If you just pass localObservations you end up assigning a Results
        // object to state instead of an array of observations. There's
        // probably a better way...
        setObservationList( localObservations.map( o => o ) );
      } );
    } catch ( err ) {
      console.error( "Unable to update local observations: ", err.message );
    }
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations.removeAllListeners( );
      realm.close( );
    };
  }, [realmRef, setObservationList] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setObservationList( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  const observationValue = {
    observationList,
    loading,
    syncObservations
  };

  return (
    <ObservationContext.Provider value={observationValue}>
      {children}
    </ObservationContext.Provider>
  );
};

export default ObservationProvider;
