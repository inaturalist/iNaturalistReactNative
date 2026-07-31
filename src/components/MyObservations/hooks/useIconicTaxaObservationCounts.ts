import fetchIconicTaxaCounts from "api/observationsTyped";
import type { IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { orderIconicTaxaCounts } from "sharedHelpers/iconicTaxaGroupOrder";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

interface Options {
  enabled?: boolean;
}

// Fetches the current user's observation counts per iconic taxa category and
// returns them ordered most-observed to least-observed, falling back to
// orderIconicTaxaCounts' tie-break rules
const useIconicTaxaObservationCounts = (
  { enabled = true }: Options = {},
): IconicTaxaGroupCount[] => {
  const currentUser = useCurrentUser( );
  const params = { user_id: currentUser?.id, ttl: -1 };

  const { data } = useAuthenticatedQuery(
    ["useIconicTaxaObservationCounts", params],
    async optsWithAuth => {
      const response = await fetchIconicTaxaCounts( params, {
        api_token: optsWithAuth.api_token ?? undefined,
      } );
      // Narrow out fetchIconicTaxaCounts' declared error cases so `results`
      // is only ever accessed on a real response.
      if ( !response || response instanceof Error || !( "results" in response ) ) {
        throw response;
      }
      return response;
    },
    { enabled: enabled && !!currentUser },
  );

  return orderIconicTaxaCounts( data?.results ?? [] );
};

export default useIconicTaxaObservationCounts;
