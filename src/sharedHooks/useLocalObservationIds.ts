import { RealmContext } from "providers/contexts";
import {
  useMemo,
} from "react";
import Observation from "realmModels/Observation";

const { useQuery } = RealmContext;

const useLocalObservationIds = () => {
  const observations = useQuery( {
    type: Observation,
    query: observations => observations
      .filtered(
        "_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil",
      )
      .sorted( [["needs_sync", true], ["_created_at", true]] ),
  } );
  const observationIds = useMemo(
    () => observations.map( a => a.uuid ),
    [observations],
  );
  return observationIds;
};

export default useLocalObservationIds;
