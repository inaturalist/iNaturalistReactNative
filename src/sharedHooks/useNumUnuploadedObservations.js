// @flow

import { RealmContext } from "providers/contexts";
import Observation from "realmModels/Observation";

const { useRealm } = RealmContext;

const useNumUnuploadedObservations = ( ): Object => {
  const realm = useRealm( );
  const unsyncedObs = Observation.filterUnsyncedObservations( realm );
  return unsyncedObs?.length;
};

export default useNumUnuploadedObservations;
