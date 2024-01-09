// @flow

import { useIsFocused } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  useEffect, useRef,
  useState
} from "react";
import Observation from "realmModels/Observation";

const { useRealm } = RealmContext;

const useLocalObservations = ( ): Object => {
  const isFocused = useIsFocused( );
  // Use refs to maintain state without triggering re-renders of hook consumers
  // when they have lost focus, which prevents other
  // views from rendering when they have focus.
  const stagedObservationList = useRef( [] );
  const [observationList, setObservationList] = useState( [] );
  const [allObsToUpload, setAllObsToUpload] = useState( [] );

  const realm = useRealm( );

  useEffect( ( ) => {
    if ( realm === null || realm.isClosed ) {
      return;
    }
    const obs = realm.objects( "Observation" );
    const localObservations = obs.sorted( "_created_at", true );
    localObservations.addListener( ( collection, _changes ) => {
      stagedObservationList.current = [...collection];

      const unsyncedObs = Observation.filterUnsyncedObservations( realm );

      if ( isFocused ) {
        setObservationList( stagedObservationList.current );
        setAllObsToUpload( unsyncedObs );
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations?.removeAllListeners( );
    };
  }, [isFocused, allObsToUpload.length, realm] );

  return {
    observationList,
    allObsToUpload
  };
};

export default useLocalObservations;
