// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";

const useFetchObsDetailsFromRealm = ( uuid: string ): Object => {
  const [observation, setObservation] = useState( null );
  const realmRef = useRef( null );

  const openObservationFromRealm = useCallback( async ( ) => {
    try {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;
      const obs = realm.objects( "Observation" ).filtered( `uuid = '${uuid}'` );
      setObservation( obs[0] );
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, uuid] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
  }, [realmRef] );

  useEffect( ( ) => {
    openObservationFromRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openObservationFromRealm, closeRealm] );

  return observation;
};

export default useFetchObsDetailsFromRealm;
