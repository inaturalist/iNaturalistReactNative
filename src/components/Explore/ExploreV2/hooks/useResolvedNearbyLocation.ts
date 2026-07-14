import { useQuery } from "@tanstack/react-query";
import type { DefaultExploreV2Location } from "providers/ExploreV2Context";
import { defaultExploreV2Location } from "providers/ExploreV2Context";

// Shared so ExploreV2Container can invalidate this cache after the user grants
// location permission, forcing a re-resolve with real coordinates.
export const EXPLORE_V2_RESOLVED_NEARBY_QUERY_KEY = ["exploreV2", "resolvedNearby"];

export interface ResolvedNearbyLocation {
  // True while we're still resolving the nearby intent (fetching coordinates /
  // checking permission). Only ever true when `enabled`.
  isResolving: boolean;
  // The resolved outcome: NEARBY with coords, WORLDWIDE fallback, or
  // NEEDS_PERMISSION. Undefined until resolved or when not enabled.
  resolved: DefaultExploreV2Location | undefined;
}

/**
 * Resolves the stored NEARBY *intent* into a concrete location at read time.
 * The location mode in context carries no coordinates; this hook fetches the
 * user's coarse location (or determines that permission is needed) and caches
 * the result so we don't re-hit the device GPS on every render or revisit.
 *
 * @param enabled Whether the current location mode is NEARBY. When false the
 * query stays idle and nothing is resolved.
 */
const useResolvedNearbyLocation = ( enabled: boolean ): ResolvedNearbyLocation => {
  const { data } = useQuery<DefaultExploreV2Location>( {
    queryKey: EXPLORE_V2_RESOLVED_NEARBY_QUERY_KEY,
    queryFn: defaultExploreV2Location,
    enabled,
    // Resolve once; a nearby search shouldn't re-fetch GPS as the user scrolls
    // or navigates back to results. Permission grants explicitly invalidate.
    staleTime: Infinity,
    gcTime: Infinity,
  } );

  return {
    isResolving: enabled && !data,
    resolved: enabled
      ? data
      : undefined,
  };
};

export default useResolvedNearbyLocation;
