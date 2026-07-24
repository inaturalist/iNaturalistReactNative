import { searchObservations } from "api/observations";
import type { ApiObservationsSearchResponse, ApiTotalBounds } from "api/types";
import { useAuthenticatedQuery } from "sharedHooks";

export const myObservationsMapBoundsKey = "useMyObservationsMapBounds";

interface UseMyObservationsMapBoundsReturn {
  totalBounds: ApiTotalBounds | undefined;
  isLoading: boolean;
}

// Fetches the bounding box for all of a user's uploaded observations, used to
// set the default zoom level for the MyObservations map view. Requests
// per_page: 0 since only total_bounds is needed, not the observations themselves.
// When a search is active, the bounds narrow to match the searched taxon
const useMyObservationsMapBounds = (
  userId: number | undefined,
  taxonId: number | undefined,
  enabled: boolean,
): UseMyObservationsMapBoundsReturn => {
  const queryKey = [myObservationsMapBoundsKey, userId, taxonId];

  const { data, isLoading } = useAuthenticatedQuery(
    queryKey,
    optsWithAuth => searchObservations(
      {
        user_id: userId,
        ...( taxonId && { taxon_id: taxonId } ),
        return_bounds: true,
        per_page: 0,
      },
      optsWithAuth,
    ),
    {
      enabled: enabled && !!userId,
    },
  );

  return {
    totalBounds: ( data as ApiObservationsSearchResponse | undefined )?.total_bounds,
    isLoading,
  };
};

export default useMyObservationsMapBounds;
