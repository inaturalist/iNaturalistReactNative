import type { ExploreV2State } from "providers/ExploreV2Context";
import {
  EXPLORE_V2_PLACE_MODE,
} from "providers/ExploreV2Context";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import type { ObservationOrderBy, SortDirection } from "types/sorting";

const PER_PAGE = 20;

export interface ExploreV2QueryParams {
  per_page: number;
  order_by: ObservationOrderBy;
  order: SortDirection;
  taxon_id?: number;
  user_id?: number;
  project_id?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  place_id?: number;
  verifiable?: boolean;
}

export interface NearbyCoords {
  lat: number;
  lng: number;
  radius: number;
}

const buildExploreV2QueryParams = (
  state: ExploreV2State,
  // NEARBY carries no coordinates in state; they're resolved at read time and
  // passed in here. Absent (nearby resolved to a worldwide fallback, or still
  // resolving) means no lat/lng params, i.e. worldwide results.
  nearbyCoords?: NearbyCoords,
): ExploreV2QueryParams => {
  const params: ExploreV2QueryParams = {
    per_page: PER_PAGE,
    verifiable: true,
    ...observationSortToApiParams( state.sortBy ),
  };

  // this might warrant moving into a selector function at some point
  switch ( state.subject?.type ) {
    case "taxon":
      params.taxon_id = state.subject.taxon.id;
      break;
    case "user":
      params.user_id = state.subject.user.id;
      break;
    case "project":
      params.project_id = state.subject.project.id;
      break;
    default:
      break;
  }

  const { location } = state;
  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      if ( nearbyCoords ) {
        params.lat = nearbyCoords.lat;
        params.lng = nearbyCoords.lng;
        params.radius = nearbyCoords.radius;
      }
      break;
    case EXPLORE_V2_PLACE_MODE.PLACE:
      params.place_id = location.place.id;
      break;
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
      break;
    default: {
      // Exhaustiveness check: ts fails if a new placeMode is added without a case.
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }

  return params;
};

export default buildExploreV2QueryParams;
