// @flow

import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useState
} from "react";
import useApiToken from "sharedHooks/useApiToken";

import Observation from "../../../models/Observation";

const { useRealm } = RealmContext;

const useRemoteObservations = ( ): Object => {
  const [loading, setLoading] = useState( false );
  const [page, setPage] = useState( 1 );
  const [fetchFromServer, setFetchFromServer] = useState( true );
  const apiToken = useApiToken( );
  const realm = useRealm( );

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
      if ( !isCurrent ) return;
      if ( !apiToken ) return;
      setLoading( true );

      // update local observations with unviewed comment or id statuses
      await Observation.fetchObservationUpdates( realm, apiToken );

      // fetch remote observations
      const results = await Observation.fetchRemoteObservations( page, realm );
      if ( results ) {
        // update realm with new or modified remote observations
        Observation.updateLocalObservationsFromRemote( realm, results );
      }

      // if ( !isCurrent ) { return; }
      setLoading( false );
    };

    if ( fetchFromServer && apiToken ) {
      fetchObservations( );
      setFetchFromServer( false );
    }
    return ( ) => {
      isCurrent = false;
    };
  }, [apiToken, page, fetchFromServer, realm] );

  return {
    loading,
    syncObservations,
    fetchNextObservations
  };
};

export default useRemoteObservations;
