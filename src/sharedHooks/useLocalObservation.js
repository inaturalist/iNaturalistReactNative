// @flow

import { RealmContext } from "providers/contexts";

const { useRealm } = RealmContext;

const useLocalObservation = ( uuid: string ): any => {
  const realm = useRealm( );

  return uuid
    ? realm.objectForPrimaryKey( "Observation", uuid )
    : null;
};

export default useLocalObservation;
