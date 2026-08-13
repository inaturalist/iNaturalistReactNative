import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import type { RealmObservation } from "realmModels/types";
import type { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { iconicTaxaGroupForTaxonName } from "sharedHelpers/iconicTaxaGroupOrder";

const { useQuery } = RealmContext;

// Observations saved locally but not yet uploaded, grouped by the iconic taxon of whatever
// taxon they have locally, so each section of the grouped-by-iconic-taxa view can pin its own
// at the top. The server doesn't know about these yet, so they can't come back in a search and
// they aren't in any section's count.
//
// This is the same filter useMyObservationsQuery uses to prepend unsynced observations to the
// flat list, so both views pin the same set.
const useUnsyncedObservationIdsByIconicTaxon = ( ): Map<ICONIC_TAXA_GROUP, string[]> => {
  const unsyncedObs = useQuery<RealmObservation>(
    {
      type: "Observation",
      query: observations => observations
        .filtered(
          "needs_sync == true AND "
          + "(_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil)",
        )
        .sorted( "_created_at", true ),
      // wider than the usual uuid-only key path because a local identification can change which
      // section an observation belongs to
      keyPaths: ["uuid", "taxon.iconic_taxon_name"],
    },
    [],
  );

  return useMemo( ( ) => {
    const byCategory = new Map<ICONIC_TAXA_GROUP, string[]>( );
    unsyncedObs.forEach( ( { taxon, uuid } ) => {
      const category = iconicTaxaGroupForTaxonName( taxon?.iconic_taxon_name );
      const uuids = byCategory.get( category );
      if ( uuids ) {
        uuids.push( uuid );
      } else {
        byCategory.set( category, [uuid] );
      }
    } );
    return byCategory;
  }, [unsyncedObs] );
};

export default useUnsyncedObservationIdsByIconicTaxon;
