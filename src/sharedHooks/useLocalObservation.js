// @flow

import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";

const { useRealm } = RealmContext;

const useLocalObservation = ( uuid: string ): Object => {
  const [localObservation, setLocalObservation] = useState( null );

  const realm = useRealm( );

  useEffect( ( ) => {
    if ( !uuid ) { return; }
    const obs = realm.objectForPrimaryKey( "Observation", uuid );
    setLocalObservation( obs );
  }, [realm, uuid] );

  return localObservation;
};

export default useLocalObservation;
