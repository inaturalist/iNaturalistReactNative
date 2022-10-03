// @flow

import {
  useCallback, useEffect, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";

const useRemoteObservations = ( ): Object => {
  const [loading, setLoading] = useState( false );
  const [page, setPage] = useState( 1 );
  const [fetchFromServer, setFetchFromServer] = useState( true );

  const syncObservations = useCallback( ( ) => {
    setFetchFromServer( true );
  }, [] );

  const fetchNextObservations = useCallback( numOfObs => {
    const nextPageToFetch = numOfObs > 0
      ? Math.ceil( numOfObs / 5 )
      : 1;
    setPage( nextPageToFetch );
    setFetchFromServer( true );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      if ( !isCurrent ) { return; }
      setLoading( true );
      const realm = await Realm.open( realmConfig );

      // update local observations with unviewed comment or id statuses
      await Observation.fetchObservationUpdates( realm );

      // fetch remote observations
      const results = await Observation.fetchRemoteObservations( page );
      if ( results ) {
        // update realm with new or modified remote observations
        Observation.updateLocalObservationsFromRemote( realm, results );
      }

      if ( !isCurrent ) { return; }
      setLoading( false );
    };

    if ( fetchFromServer ) {
      fetchObservations( );
      setFetchFromServer( false );
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [page, fetchFromServer] );

  return {
    loading,
    syncObservations,
    fetchNextObservations
  };
};

export default useRemoteObservations;
