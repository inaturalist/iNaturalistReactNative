import { RealmContext } from "providers/contexts";
import {
  useMemo,
} from "react";
import Observation, { UNSYNCED_OBSERVATIONS_FILTER } from "realmModels/Observation";

const { useQuery } = RealmContext;

const useObservationSyncCounts = () => {
  const observations = useQuery( {
    type: Observation,
    query: observations => observations.filtered( UNSYNCED_OBSERVATIONS_FILTER ),
  } );
  const counts = useMemo(
    () => {
      const obsMissingBasics = observations.filter( obs => obs.missingBasics() );
      return {
        numUnuploadedObs: observations.length,
        numUnuploadedObsMissingBasics: obsMissingBasics.length,
      };
    },
    [observations],
  );
  return counts;
};

export default useObservationSyncCounts;
