// @flow

import { RealmContext } from "providers/contexts.ts";

const { useRealm } = RealmContext;

const useLocalObservation = ( uuid: string ): Object => {
  const realm = useRealm( );

  return uuid
    ? realm.objectForPrimaryKey( "Observation", uuid )
    : null;
};

export default useLocalObservation;
