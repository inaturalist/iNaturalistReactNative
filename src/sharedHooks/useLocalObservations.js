// @flow

import { RealmContext } from "providers/contexts";
import {
  useEffect, useRef,
  useState,
} from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

import useLayoutPrefs from "./useLayoutPrefs";

const { useRealm } = RealmContext;

const deletionFilters
  = "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil";

const sortedFilters = [["needs_sync", true], ["_created_at", true]];

const useLocalObservations = ( ): Object => {
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const [observationList, setObservationList] = useState( [] );

  const prevListRef = useRef( {
    list: [],
    count: 0,
    unsyncedCount: 0,
    isDefaultMode: null,
  } );

  const { isDefaultMode } = useLayoutPrefs();

  const realm = useRealm( );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      // Satisfy the useEffect return type by returning a destructor function.
      return () => {};
    }
    const filteredObservations = realm.objects( "Observation" )
      .filtered( deletionFilters )
      .sorted( sortedFilters );

    const handleChange = ( _collection, changes ) => {
      const { insertions, newModifications, deletions } = changes;

      const unsyncedCount = Observation.filterUnsyncedObservations( realm ).length;

      // limit list updates to when there are actual realm changes
      if ( ( insertions.length > 0
          || newModifications.length > 0
          || deletions.length > 0 )
        || filteredObservations.length !== prevListRef.current.count
        || unsyncedCount !== prevListRef.current.unsyncedCount
        || isDefaultMode !== prevListRef.current.isDefaultMode
      ) {
        // amanda 20250522: React Native works best when minimal data is passed to components,
        // so there aren't costly rerenders. these data transformations ensure the UI is getting
        // exactly what it needs to display and that we're not passing around larger objects
        // or actual Realm objects, which is especially helpful since we're doing an absurd amount
        // of prop drilling in MyObservations

        const mapObservation = isDefaultMode
          ? Observation.mapObservationForMyObsDefaultMode
          : Observation.mapObservationForMyObsAdvancedMode;

        let mappedObservations;

        if ( isDefaultMode !== prevListRef.current.isDefaultMode ) {
          // Mode change requires full remap
          mappedObservations = Array.from( filteredObservations )
            .filter( obs => obs.isValid() )
            .map( mapObservation );
        } else {
          const modifiedUuids = new Set(
            newModifications
              .map( index => filteredObservations[index] )
              .filter( obs => obs?.isValid() )
              .map( obs => obs.uuid ),
          );

          const previousObsByUuid = Object.fromEntries(
            prevListRef.current.list.map( obs => [obs.uuid, obs] ),
          );

          mappedObservations = Array.from( filteredObservations )
            .filter( obs => obs.isValid() )
            .map( obs => {
              if ( modifiedUuids.has( obs.uuid ) ) {
                return mapObservation( obs );
              }
              return previousObsByUuid[obs.uuid] ?? mapObservation( obs );
            } );
        }

        setObservationList( mappedObservations );
        setNumUnuploadedObservations( unsyncedCount );

        prevListRef.current = {
          list: mappedObservations,
          count: filteredObservations.length,
          unsyncedCount,
          isDefaultMode,
        };
      }
    };

    filteredObservations.addListener( handleChange );
    return ( ) => {
      // remember to remove listeners to avoid async updates
      if ( filteredObservations && !realm.isClosed ) {
        filteredObservations?.removeAllListeners( );
      }
    };
  }, [isDefaultMode, realm, setNumUnuploadedObservations] );

  return observationList;
};

export default useLocalObservations;
