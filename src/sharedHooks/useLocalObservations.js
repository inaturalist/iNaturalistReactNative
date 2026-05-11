// @flow

import { RealmContext } from "providers/contexts";
import {
  useEffect, useRef,
  useState,
} from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";
import { v4 as uuidv4 } from "uuid";

function isDefaultMode( ) {
  return useStore.getState( ).layout.isDefaultMode === true;
}

const { useRealm } = RealmContext;

const deletionFilters
  = "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil";

const sortedFilters = [["needs_sync", true], ["_created_at", true]];

const useLocalObservations = ( ): Object => {
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  // Use refs to maintain state without triggering re-renders of hook consumers
  // when they have lost focus, which prevents other
  // views from rendering when they have focus.
  const [observationList, setObservationList] = useState( [] );

  const prevListRef = useRef( {
    list: [],
    count: 0,
    unsyncedCount: 0,
    isDefaultMode: null,
  } );

  const realm = useRealm( );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      // Satisfy the useEffect return type by returning a destructor function.
      return () => {};
    }
    const localObservations = realm.objects( "Observation" );

    const handleChange = ( collection, changes ) => {
      const { insertions, newModifications, deletions } = changes;
      const filteredObservations = localObservations
        .filtered( deletionFilters )
        .sorted( sortedFilters );

      const unsyncedCount = Observation.filterUnsyncedObservations( realm ).length;
      const currentIsDefaultMode = isDefaultMode( );

      // limit list updates to when there are actual realm changes
      if ( ( insertions.length > 0
          || newModifications.length > 0
          || deletions.length > 0 )
        || filteredObservations.length !== prevListRef.current.count
        || unsyncedCount !== prevListRef.current.unsyncedCount
        || currentIsDefaultMode !== prevListRef.current.isDefaultMode
      ) {
        const transactionId = uuidv4();
        performance.mark( "start", {
          detail: {
            transactionId,
            insertions: insertions.length,
            modifications: newModifications.length,
            deletions: deletions.length,
          },
        } );
        // amanda 20250522: React Native works best when minimal data is passed to components,
        // so there aren't costly rerenders. these data transformations ensure the UI is getting
        // exactly what it needs to display and that we're not passing around larger objects
        // or actual Realm objects, which is especially helpful since we're doing an absurd amount
        // of prop drilling in MyObservations

        const mapObservation = currentIsDefaultMode
          ? Observation.mapObservationForMyObsDefaultMode
          : Observation.mapObservationForMyObsAdvancedMode;

        let mappedObservations;

        if ( currentIsDefaultMode !== prevListRef.current.isDefaultMode ) {
          performance.mark( "start-rebuild", { detail: { transactionId } } );

          // Mode change requires full remap
          mappedObservations = Array.from( filteredObservations )
            .filter( obs => obs.isValid() )
            .map( obs => mapObservation( obs, isDefaultMode ) );

          performance.mark( "end-rebuild", { detail: { transactionId } } );
        } else {
          performance.mark( "start-inplace", { detail: { transactionId } } );

          const modifiedUuids = newModifications
            .map( index => localObservations[index] )
            .filter( obs => obs?.isValid() )
            .map( obs => obs.uuid );

          const previousObsByUuid = Object.fromEntries(
            prevListRef.current.list.map( obs => [obs.uuid, obs] ),
          );

          mappedObservations = Array.from( filteredObservations )
            .filter( obs => obs.isValid() )
            .map( obs => {
              if ( modifiedUuids.includes( obs.uuid ) ) {
                return mapObservation( obs, currentIsDefaultMode );
              }
              return previousObsByUuid[obs.uuid] ?? mapObservation( obs, currentIsDefaultMode );
            } );

          performance.mark( "end-inplace", { detail: { transactionId } } );
        }

        setObservationList( mappedObservations );
        setNumUnuploadedObservations( unsyncedCount );

        prevListRef.current = {
          list: mappedObservations,
          count: filteredObservations.length,
          unsyncedCount,
          isDefaultMode: currentIsDefaultMode,
        };
        performance.mark( "end", { detail: { transactionId } } );
      }
    };

    localObservations.addListener( handleChange );
    return ( ) => {
      // remember to remove listeners to avoid async updates
      if ( localObservations && !realm.isClosed ) {
        localObservations?.removeAllListeners( );
      }
    };
  }, [realm, setNumUnuploadedObservations] );

  return {
    observationList,
    totalResults: observationList.length,
  };
};

export default useLocalObservations;
