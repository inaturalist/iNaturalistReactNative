import fetchIconicTaxaCounts from "api/observationsTyped";
import type { IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { orderIconicTaxaCounts } from "sharedHelpers/iconicTaxaGroupOrder";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

// Every category at zero, in the tie-break order, for before the counts land
const NO_COUNTS = orderIconicTaxaCounts( [] );

interface IconicTaxaObservationCountsOptions {
  enabled?: boolean;
}

interface IconicTaxaObservationCountsResult {
  counts: IconicTaxaGroupCount[];
  isLoading: boolean;
  refetch: ( ) => void;
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

  const { data, isLoading, refetch } = useAuthenticatedQuery<IconicTaxaGroupCount[]>(
    ["useIconicTaxaObservationCounts", currentUser?.id],
    async optsWithAuth => {
      const response = await fetchIconicTaxaCounts( params, {
        api_token: optsWithAuth.api_token ?? undefined,
      } );
      return orderIconicTaxaCounts( response?.results ?? [] );
    },
    { enabled: enabled && !!currentUser },
  );

  return { counts: data ?? NO_COUNTS, isLoading, refetch };
};

export default useIconicTaxaObservationCounts;
