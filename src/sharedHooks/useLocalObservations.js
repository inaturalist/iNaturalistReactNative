// @flow

import { useIsFocused } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  useEffect, useRef,
  useState
} from "react";

const { useRealm } = RealmContext;

const useLocalObservations = ( ): Object => {
  const isFocused = useIsFocused( );
  // Use refs to maintain state without triggering re-renders of hook consumers
  // when they have lost focus, which prevents other
  // views from rendering when they have focus.
  const stagedObservationList = useRef( [] );
  const [observationList, setObservationList] = useState( [] );

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

      if ( isFocused ) {
        setObservationList( stagedObservationList.current );
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations?.removeAllListeners( );
    };
  }, [isFocused, realm] );

  return {
    observationList
  };
};

export default useLocalObservations;
