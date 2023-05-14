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
  // use a ref as a temporary store because MyObservations page doesn't unmount on blue
  // only updating state when focused will help prevent MyObservations from
  // blocking other components from rendering
  const stagedObservationList = useRef( [] );
  const stagedObsToUpload = useRef( [] );
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
      if ( localObservations.length === 0 ) { return; }
      // started hitting https://github.com/realm/realm-js/issues/4484 on
      // 2022-09-13 for no reason i can discern Note that if you
      // setObservationsList to collection, it is a Realm.Collection, not an
      // array, which doesn't seem to work. _.compact or Array.from will
      // create an array of Realm objects... which will probably require some
      // degree of pagination in the future
      // setObservationList( _.compact( collection ) );
      stagedObservationList.current = [...collection];

      const unsyncedObs = Observation.filterUnsyncedObservations( realm );

      stagedObsToUpload.current = Array.from( unsyncedObs );

      if ( isFocused ) {
        setObservationList( stagedObservationList.current );
        setAllObsToUpload( stagedObsToUpload.current );
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations.removeAllListeners( );
    };
  }, [isFocused, allObsToUpload.length, realm] );

  useEffect( ( ) => {
    if ( isFocused ) {
      setObservationList( stagedObservationList.current );
      setAllObsToUpload( stagedObsToUpload.current );
    }
  }, [isFocused] );

  return {
    observationList,
    allObsToUpload
  };
};

export default useLocalObservations;
