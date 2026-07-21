import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import Observation from "realmModels/Observation";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToRealmSort } from "sharedHelpers/observationsSort";

const { useQuery } = RealmContext;

const useLocalObservationIds = ( sortBy?: OBSERVATIONS_SORT ) => {
  const unsyncedObs = useQuery(
    {
      type: Observation,
      query: observations => observations
        .filtered( "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil" )
        .sorted( sortBy
          ? [observationSortToRealmSort( sortBy )]
          : [["needs_sync", true], ["_created_at", true]] ),
      // widening this beyond uuid means more frequent re-renders for every consumer,
      // so we only do it when we need a local sort applied to the results
      keyPaths: sortBy
        ? ["uuid", "_created_at", "observed_on_string"]
        : ["uuid"],
    },
    [sortBy],
  );

  return useMemo(
    ( ) => unsyncedObs.map( ( { uuid }: { uuid: string } ) => ( { uuid } ) ),
    [unsyncedObs],
  );
};

export default useLocalObservationIds;
