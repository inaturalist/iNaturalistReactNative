import fetchIconicTaxaCounts from "api/observationsTyped";
import { useMemo } from "react";
import type { IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { orderIconicTaxaCounts } from "sharedHelpers/iconicTaxaGroupOrder";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

interface IconicTaxaObservationCountsOptions {
  enabled?: boolean;
}

interface IconicTaxaObservationCountsResult {
  counts: IconicTaxaGroupCount[];
  isLoading: boolean;
}

// Fetches the current user's observation counts per iconic taxa category and
// returns them ordered most-observed to least-observed, falling back to
// orderIconicTaxaCounts' tie-break rules.
//
// isLoading matters to callers because counts are what decide section order: until they land,
// every category reads as zero and orders by the tie-break list, so rendering before then means
// showing sections in the wrong order and reshuffling them a moment later.
const useIconicTaxaObservationCounts = (
  { enabled = true }: IconicTaxaObservationCountsOptions = {},
): IconicTaxaObservationCountsResult => {
  const currentUser = useCurrentUser( );
  const params = { user_id: currentUser?.id, ttl: -1 };

  const { data, isLoading } = useAuthenticatedQuery(
    ["useIconicTaxaObservationCounts", currentUser?.id],
    optsWithAuth => fetchIconicTaxaCounts( params, {
      api_token: optsWithAuth.api_token ?? undefined,
    } ),
    { enabled: enabled && !!currentUser },
  );

  const counts = useMemo( ( ) => orderIconicTaxaCounts( data?.results ?? [] ), [data] );

  return { counts, isLoading };
};

export default useIconicTaxaObservationCounts;
