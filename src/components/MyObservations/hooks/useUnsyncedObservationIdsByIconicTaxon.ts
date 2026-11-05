import type { HeldUpload } from "components/MyObservations/helpers/iconicTaxaSections";
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
// A first-time upload is held separately after needs_sync clears, until it shows up in
// serverUuids, so it doesn't vanish when the cached pages predate its existence. It carries its
// observed date so the view can place it where the current sort puts it.
interface PinnedObservations {
  unsyncedByCategory: Map<ICONIC_TAXA_GROUP, string[]>;
  uploadsByCategory: Map<ICONIC_TAXA_GROUP, HeldUpload[]>;
}

function addTo<T>(
  byCategory: Map<ICONIC_TAXA_GROUP, T[]>,
  category: ICONIC_TAXA_GROUP,
  item: T,
) {
  const items = byCategory.get( category );
  if ( items ) {
    items.push( item );
  } else {
    byCategory.set( category, [item] );
  }
}

const useUnsyncedObservationIdsByIconicTaxon = (
  serverUuids?: Set<string>,
): PinnedObservations => {
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
    const unsyncedByCategory = new Map<ICONIC_TAXA_GROUP, string[]>( );
    const uploadsByCategory = new Map<ICONIC_TAXA_GROUP, HeldUpload[]>( );
    pinnedObs.forEach( ( {
      needs_sync: needsSync,
      observed_on: observedOn,
      observed_on_string: observedOnString,
      taxon,
      uuid,
    } ) => {
      const category = iconicTaxaGroupForTaxonName( taxon?.iconic_taxon_name );
      if ( needsSync ) {
        addTo( unsyncedByCategory, category, uuid );
        return;
      }
      if ( serverUuids?.has( uuid ) ) return;
      // The server only fills in observed_on once the observation syncs back. Locally the
      // string starts with the date, as YYYY-MM-DD.
      addTo( uploadsByCategory, category, {
        uuid,
        observedOn: observedOn || observedOnString?.slice( 0, 10 ) || null,
      } );
    } );
    return { unsyncedByCategory, uploadsByCategory };
  }, [pinnedObs, serverUuids] );
};

export default useUnsyncedObservationIdsByIconicTaxon;
