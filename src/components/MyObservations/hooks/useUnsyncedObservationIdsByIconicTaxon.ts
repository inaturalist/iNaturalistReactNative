import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import type { RealmObservation } from "realmModels/types";
import type { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { iconicTaxaGroupForTaxonName } from "sharedHelpers/iconicTaxaGroupOrder";
import useStore from "stores/useStore";

const { useQuery } = RealmContext;

// Observations saved locally but not yet uploaded, grouped by the iconic taxon of whatever
// taxon they have locally, so each section of the grouped-by-iconic-taxa view can pin its own
// at the top. The server doesn't know about these yet, so they can't come back in a search and
// they aren't in any section's count.
//
// This is the same filter useMyObservationsQuery uses to prepend unsynced observations to the
// flat list, so both views pin the same set.
//
// An upload stays pinned after needs_sync clears, until it shows up in serverUuids,
// so it doesn't vanish when the cached pages predate its existence.
const useUnsyncedObservationIdsByIconicTaxon = (
  serverUuids?: Set<string>,
): Map<ICONIC_TAXA_GROUP, string[]> => {
  const firstUploadUuids = useStore( state => state.firstUploadUuids );

  const pinnedObs = useQuery<RealmObservation & { needs_sync: boolean }>(
    {
      type: "Observation",
      query: observations => observations
        .filtered(
          "(needs_sync == true AND "
          + "(_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil)) "
          + "OR (uuid IN $0 AND _deleted_at == nil)",
          firstUploadUuids,
        )
        .sorted( "_created_at", true ),
      // wider than the usual uuid-only key path because a local identification can change which
      // section an observation belongs to, and needs_sync decides whether a pin is still held
      keyPaths: ["uuid", "needs_sync", "taxon.iconic_taxon_name"],
    },
    [firstUploadUuids],
  );

  return useMemo( ( ) => {
    const byCategory = new Map<ICONIC_TAXA_GROUP, string[]>( );
    pinnedObs.forEach( ( { needs_sync: needsSync, taxon, uuid } ) => {
      if ( !needsSync && serverUuids?.has( uuid ) ) return;
      const category = iconicTaxaGroupForTaxonName( taxon?.iconic_taxon_name );
      const uuids = byCategory.get( category );
      if ( uuids ) {
        uuids.push( uuid );
      } else {
        byCategory.set( category, [uuid] );
      }
    } );
    return byCategory;
  }, [pinnedObs, serverUuids] );
};

export default useUnsyncedObservationIdsByIconicTaxon;
