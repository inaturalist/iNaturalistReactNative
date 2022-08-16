// @flow

import {
  useEffect, useRef, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";

const useLocalObservations = ( ): Object => {
  const [observationList, setObservationList] = useState( [] );
  const [addListener, setAddListener] = useState( false );
  const [allObsToUpload, setAllObsToUpload] = useState( [] );
  const [unuploadedObsList, setUnuploadedObsList] = useState( [] );

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );

  useEffect( ( ) => {
    // fwiw, I don't think we will need two useEffects here and with openRealm if we can
    // access realm throughout the app via Realm Provider.
    const realm = realmRef.current;
    if ( realm === null || !addListener ) { return; }
    const obs = realm?.objects( "Observation" );
    const localObservations = obs.sorted( "_created_at", true );
    localObservations.addListener( ( ) => {
      // If you just pass localObservations you end up assigning a Results
      // object to state instead of an array of observations. There's
      // probably a better way...
      if ( localObservations.length === 0 ) { return; }
      setObservationList( localObservations.map( o => o ) );

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
  }, [addListener, allObsToUpload.length] );

  useEffect( ( ) => {
    const openRealm = async ( ) => {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;
      setAddListener( true );
    };
    openRealm( );
  }, [] );

  return {
    observationList,
    allObsToUpload,
    unuploadedObsList
  };
};

export default useLocalObservations;
