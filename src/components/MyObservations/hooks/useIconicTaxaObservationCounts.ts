import fetchIconicTaxaCounts from "api/observationsTyped";
import { useMemo } from "react";
import type { IconicTaxaGroupCount } from "sharedHelpers/iconicTaxaGroupOrder";
import { orderIconicTaxaCounts } from "sharedHelpers/iconicTaxaGroupOrder";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

interface IconicTaxaObservationCountsOptions {
  enabled?: boolean;
}

// Fetches the current user's observation counts per iconic taxa category and
// returns them ordered most-observed to least-observed, falling back to
// orderIconicTaxaCounts' tie-break rules
const useIconicTaxaObservationCounts = (
  { enabled = true }: IconicTaxaObservationCountsOptions = {},
): IconicTaxaGroupCount[] => {
  const currentUser = useCurrentUser( );
  const params = { user_id: currentUser?.id, ttl: -1 };

  const { data } = useAuthenticatedQuery(
    ["useIconicTaxaObservationCounts", currentUser?.id],
    optsWithAuth => fetchIconicTaxaCounts( params, {
      api_token: optsWithAuth.api_token ?? undefined,
    } ),
    { enabled: enabled && !!currentUser },
  );

  return useMemo( ( ) => orderIconicTaxaCounts( data?.results ?? [] ), [data] );
};

export default useIconicTaxaObservationCounts;
