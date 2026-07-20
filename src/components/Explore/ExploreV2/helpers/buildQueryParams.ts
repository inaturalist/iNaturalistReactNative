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
  unobserved_by_user_id?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  place_id?: number;
  verifiable?: boolean;
}

const buildExploreV2QueryParams = (
  state: ExploreV2State,
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
    case "unobserved":
      params.unobserved_by_user_id = state.subject.user.id;
      break;
    default:
      break;
  }

  const { location } = state;
  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      params.lat = location.lat;
      params.lng = location.lng;
      params.radius = location.radius;
      break;
    case EXPLORE_V2_PLACE_MODE.PLACE:
      params.place_id = location.place.id;
      break;
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
    case EXPLORE_V2_PLACE_MODE.UNINITIALIZED:
    case EXPLORE_V2_PLACE_MODE.NEEDS_PERMISSION:
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
