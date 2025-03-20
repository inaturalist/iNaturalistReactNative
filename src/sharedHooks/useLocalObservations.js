// @flow

import { RealmContext } from "providers/contexts.ts";
import {
  useEffect, useRef,
  useState
} from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const useLocalObservations = ( ): Object => {
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  // Use refs to maintain state without triggering re-renders of hook consumers
  // when they have lost focus, which prevents other
  // views from rendering when they have focus.
  const stagedObservationList = useRef( [] );
  const [observationList, setObservationList] = useState( [] );
  const [totalResults, setTotalResults] = useState( null );

  const realm = useRealm( );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return;
    }
    const localObservations = realm.objects( "Observation" );
    localObservations.addListener( ( collection, _changes ) => {
      const sortedCollection = collection.sorted(
        [["needs_sync", true], ["_created_at", true]]
      );

      // eslint-disable-next-line max-len
      const deletionFilters = "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == null";
      const obsNotFlaggedForDeletion = sortedCollection.filtered( deletionFilters );
      stagedObservationList.current = [...obsNotFlaggedForDeletion];

      const unsynced = Observation.filterUnsyncedObservations( realm );
      setNumUnuploadedObservations( unsynced.length );

      setObservationList( stagedObservationList.current );
      setTotalResults( obsNotFlaggedForDeletion.length );
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations?.removeAllListeners( );
    };
  }, [realm, setNumUnuploadedObservations] );

  return {
    observationList: observationList.filter( o => o.isValid() ),
    totalResults
  };
};

export default useLocalObservations;
