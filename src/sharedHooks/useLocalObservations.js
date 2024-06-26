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

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return;
    }
    const obsNotFlaggedForDeletion = realm
      .objects( "Observation" ).filtered( "_deleted_at == nil" );
    const localObservations = obsNotFlaggedForDeletion.sorted( "_created_at", true );
    localObservations.addListener( ( collection, _changes ) => {
      stagedObservationList.current = [...collection];

      const unsynced = Observation.filterUnsyncedObservations( realm );
      const uploadUuids = unsynced.map( o => o.uuid );
      setNumUnuploadedObservations( unsynced.length );

      if ( isFocused ) {
        setObservationList( stagedObservationList.current );
        setUnsyncedUuids( uploadUuids );
        // 20240530 amanda - we only need about half of the keys in an Observation object to
        // display to the user on MyObservations, so I think passing around smaller objects
        // will improve render time here. if it causes problems, we can remove and pass around
        // the full realm object
        // const mappedObservations = stagedObservationList.current
        //   .map( o => Observation.mapObservationForFlashList( o ) );
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
