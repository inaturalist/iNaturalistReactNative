import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import Observation from "realmModels/Observation";

const { useQuery } = RealmContext;

const UNSYNCED_FILTER
  = "_synced_at == null || _synced_at <= _updated_at"
  + " || ANY observationPhotos._synced_at == null"
  + " || ANY observationSounds._synced_at == null";

const KEY_PATHS = [
  "_synced_at",
  "_updated_at",
  "observed_on_string",
  "time_observed_at",
  "latitude",
  "privateLatitude",
  "observationPhotos._synced_at",
  "observationSounds._synced_at",
];

interface ObservationCounts {
  unsyncedObservationsCount: number;
  observationsMissingBasicsCount: number;
}

const useObservationCounts = ( ): ObservationCounts => {
  const unsyncedObs = useQuery(
    {
      type: Observation,
      query: obsservations => obsservations.filtered( UNSYNCED_FILTER ),
      keyPaths: KEY_PATHS,
    },
  );

  return useMemo(
    ( ) => ( {
      unsyncedObservationsCount: unsyncedObs.length,
      observationsMissingBasicsCount: unsyncedObs
        .filter( obs => obs.missingBasics( ) ).length,
    } ),
    [unsyncedObs],
  );
};

export default useObservationCounts;
