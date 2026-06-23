import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import Observation, { UNSYNCED_FILTER } from "realmModels/Observation";

const { useQuery } = RealmContext;

// only re-evaluate unsync'd obs / missing basics when these change
const KEY_PATHS = [
  "_synced_at",
  "_updated_at",
  "observed_on_string",
  "time_observed_at",
  "latitude",
  "privateLatitude",
  "observationPhotos._synced_at",
  "observationSounds._synced_at",
  "observationFieldValues._synced_at",
  "projectObservations._synced_at",
];

interface ObservationCounts {
  numUnuploadedObservations: number;
  numObsMissingBasics: number;
}

const useObservationCounts = ( ): ObservationCounts => {
  const unsyncedObs = useQuery(
    {
      type: Observation,
      query: observations => observations.filtered( UNSYNCED_FILTER ),
      keyPaths: KEY_PATHS,
    },
    [],
  );

  return useMemo(
    ( ) => ( {
      numUnuploadedObservations: unsyncedObs.length,
      numObsMissingBasics: unsyncedObs
        .filter( obs => obs.missingBasics( ) ).length,
    } ),
    [unsyncedObs],
  );
};

export default useObservationCounts;
