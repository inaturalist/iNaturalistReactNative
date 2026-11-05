import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import type { RealmObservation } from "realmModels/types";
import type { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import { iconicTaxaGroupForTaxonName } from "sharedHelpers/iconicTaxaGroupOrder";
import useStore from "stores/useStore";

const { useQuery } = RealmContext;

// Local observations the grouped view adds to its cached server pages, grouped by local taxon.
// - Unsynced: not on the server yet, so pinned at the top of their section (same filter as
//   useMyObservationsQuery's flat list).
// - Uploaded: first-time uploads from this session (firstUploadUuids). Cached pages predate
//   them, so buildIconicTaxaRows places them by the current sort until their server copy loads.
interface PinnedObservations {
  unsyncedByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  uploadsByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
}

function addTo(
  byCategory: Map<ICONIC_TAXA_GROUP, string[]>,
  category: ICONIC_TAXA_GROUP,
  uuid: string,
) {
  const uuids = byCategory.get( category );
  if ( uuids ) {
    uuids.push( uuid );
  } else {
    byCategory.set( category, [uuid] );
  }
}

const usePinnedObservationsByIconicTaxon = ( ): PinnedObservations => {
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
      // section an observation belongs to, and needs_sync decides whether it's still unsynced
      keyPaths: ["uuid", "needs_sync", "taxon.iconic_taxon_name"],
    },
    [firstUploadUuids],
  );

  return useMemo( ( ) => {
    const unsyncedByCategory = new Map<ICONIC_TAXA_GROUP, string[]>( );
    const uploadsByCategory = new Map<ICONIC_TAXA_GROUP, string[]>( );
    pinnedObs.forEach( ( { needs_sync: needsSync, taxon, uuid } ) => {
      const category = iconicTaxaGroupForTaxonName( taxon?.iconic_taxon_name );
      addTo( needsSync
        ? unsyncedByCategory
        : uploadsByCategory, category, uuid );
    } );
    return { unsyncedByCategory, uploadsByCategory };
  }, [pinnedObs] );
};

export default usePinnedObservationsByIconicTaxon;
