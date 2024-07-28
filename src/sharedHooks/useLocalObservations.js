// @flow

import { useIsFocused } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  useEffect, useRef,
  useState
} from "react";
import Observation from "realmModels/Observation";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const useLocalObservations = ( ): Object => {
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const isFocused = useIsFocused( );
  // Use refs to maintain state without triggering re-renders of hook consumers
  // when they have lost focus, which prevents other
  // views from rendering when they have focus.
  const stagedObservationList = useRef( [] );
  const [observationList, setObservationList] = useState( [] );
  const [unsyncedUuids, setUnsyncedUuids] = useState( [] );

  const realm = useRealm( );

  // This works but at great performance cost. I was seeing times of 1.6-1.8
  // seconds when sorting 450+ observations. We need a faster way to do this.
  // ~~~~kueda20240707
  // function sortByUnsynced( array ) {
  //   return array.sort( ( a, b ) => {
  //     const isUnsyncedA = a.needsSync();
  //     const isUnsyncedB = b.needsSync();

  //     // If both are unsynced or synced, sort by _created_at
  //     if ( isUnsyncedA && isUnsyncedB ) {
  //       return b._created_at - a._created_at;

  //     // Otherwise, show unsynced first
  //     } if ( isUnsyncedA ) {
  //       return -1;
  //     } if ( isUnsyncedB ) {
  //       return 1;
  //     }
  //     return b._created_at - a._created_at;
  //   } );
  // }

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return;
    }
    const localObservations = realm.objects( "Observation" ).sorted(
      [["needs_sync", true], ["_created_at", true]]
    );
    localObservations.addListener( ( collection, _changes ) => {
      const obsNotFlaggedForDeletion = collection.filtered( "_deleted_at == nil" );
      stagedObservationList.current = [...obsNotFlaggedForDeletion];

      const unsynced = Observation.filterUnsyncedObservations( realm );
      const uploadUuids = unsynced.map( o => o.uuid );
      setNumUnuploadedObservations( unsynced.length );

      if ( isFocused ) {
        setObservationList( stagedObservationList.current );
        setUnsyncedUuids( uploadUuids );
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations?.removeAllListeners( );
    };
  }, [isFocused, realm, setNumUnuploadedObservations] );

  return {
    observationList,
    unsyncedUuids
  };
};

export default useLocalObservations;
