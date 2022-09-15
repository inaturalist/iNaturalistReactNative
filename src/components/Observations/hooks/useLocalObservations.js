// @flow

import _ from "lodash";
import {
  useEffect, useState
} from "react";

import Observation from "../../../models/Observation";
import { RealmContext } from "../../../providers/contexts";

const { useRealm } = RealmContext;

const useLocalObservations = ( ): Object => {
  const [observationList, setObservationList] = useState( [] );
  const [allObsToUpload, setAllObsToUpload] = useState( [] );
  const [unuploadedObsList, setUnuploadedObsList] = useState( [] );

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
      setObservationList( _.compact( collection ) );

      const unsyncedObs = Observation.filterUnsyncedObservations( realm );
      setUnuploadedObsList( unsyncedObs.map( o => o ) );

      if ( allObsToUpload.length === 0 ) {
        setAllObsToUpload( unsyncedObs.map( o => o ) );
      }
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations.removeAllListeners( );
    };
  }, [allObsToUpload.length, realm] );

  return {
    observationList,
    allObsToUpload,
    unuploadedObsList
  };
};

export default useLocalObservations;
