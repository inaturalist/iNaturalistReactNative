// @flow
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Node } from "react";
import Realm from "realm";

import realmConfig from "../models/index";
import { ObservationContext } from "./contexts";

type Props = {
  children: any
}

const ObservationProvider = ( { children }: Props ): Node => {
  const [observationId, setObservationId] = useState( null );
  const [observationList, setObservationList] = useState( [] );

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );
  // The first time we query the Realm collection we add a listener to it.
  // We store the listener in "subscriptionRef" to be able to remove it when the component unmounts.
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      // Since this is a non-sync realm, realm will be opened synchronously when calling "Realm.open"
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;

      // When querying a realm to find objects (e.g. realm.objects('Observation')) the result we get back
      // and the objects in it are "live" and will always reflect the latest state.
      const localObservations = realm.objects( "Observation" );
      if ( localObservations?.length ) {
        setObservationList( localObservations );
      }

      // Live queries and objects emit notifications when something has changed that we can listen for.
      subscriptionRef.current = localObservations;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setObservationList] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

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

  const updateObservationId = obsId => setObservationId( obsId );

  const fetchObservations = ( ) => openRealm( );

  const observationValue = {
    observationList,
    observationId,
    updateObservationId,
    fetchObservations
  };

  return (
    <ObservationContext.Provider value={observationValue}>
      {children}
    </ObservationContext.Provider>
  );
};

export default ObservationProvider;
