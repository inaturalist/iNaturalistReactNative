import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import Observation from "realmModels/Observation";

const { useQuery } = RealmContext;

const getId = ( { uuid }: { uuid:string } ) => ( { uuid } );

const useLocalObservationIds = ( ) => {
  const unsyncedObs = useQuery(
    {
      type: Observation,
      query: observations => observations
        .filtered( "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil" )
        .sorted( [["needs_sync", true], ["_created_at", true]] ),
      keyPaths: ["uuid"],
    },
  );

  return useMemo(
    ( ) => unsyncedObs.map( getId ),
    [unsyncedObs],
  );
};

export default useLocalObservationIds;
