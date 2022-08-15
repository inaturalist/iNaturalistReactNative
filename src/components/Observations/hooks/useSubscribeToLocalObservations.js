// @flow

import {
  useEffect, useRef, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";

const useSubscribeToLocalObservations = ( ): Object => {
  const [observationList, setObservationList] = useState( [] );
  const [unuploadedObsList, setUnuploadedObsList] = useState( [] );
  const [addListener, setAddListener] = useState( false );

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
      if ( localObservations.length > 0 ) {
        setObservationList( localObservations.map( o => o ) );
      }
    } );

    const unsyncedFilter = "_synced_at == null || _synced_at <= _updated_at";
    const unsyncedObs = obs.filtered( unsyncedFilter );
    unsyncedObs.addListener( ( ) => {
      setUnuploadedObsList( unsyncedObs.map( o => o ) );
    } );
    // eslint-disable-next-line consistent-return
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations.removeAllListeners( );
      unsyncedObs.removeAllListeners( );
    };
  }, [addListener] );

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
    unuploadedObsList
  };
};

export default useSubscribeToLocalObservations;
