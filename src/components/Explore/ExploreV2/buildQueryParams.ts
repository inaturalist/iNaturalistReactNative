import type { ExploreV2State } from "providers/ExploreV2Context";
import {
  EXPLORE_V2_PLACE_MODE,
  EXPLORE_V2_SORT,
} from "providers/ExploreV2Context";

const PER_PAGE = 20;

export interface ExploreV2QueryParams {
  per_page: number;
  order_by: "created_at" | "observed_on" | "votes";
  order: "asc" | "desc";
  taxon_id?: number;
  user_id?: number;
  project_id?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  place_id?: number;
  verifiable?: boolean;
}

const sortToOrder: Record<
  EXPLORE_V2_SORT,
  { order_by: "created_at" | "observed_on" | "votes"; order: "asc" | "desc" }
> = {
  [EXPLORE_V2_SORT.DATE_UPLOADED_NEWEST]: { order_by: "created_at", order: "desc" },
  [EXPLORE_V2_SORT.DATE_UPLOADED_OLDEST]: { order_by: "created_at", order: "asc" },
  [EXPLORE_V2_SORT.DATE_OBSERVED_NEWEST]: { order_by: "observed_on", order: "desc" },
  [EXPLORE_V2_SORT.DATE_OBSERVED_OLDEST]: { order_by: "observed_on", order: "asc" },
  [EXPLORE_V2_SORT.MOST_FAVED]: { order_by: "votes", order: "desc" },
};

const buildExploreV2QueryParams = (
  state: ExploreV2State,
): ExploreV2QueryParams => {
  const params: ExploreV2QueryParams = {
    per_page: PER_PAGE,
    verifiable: true,
    ...sortToOrder[state.sortBy],
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
      params.lat = location.lat;
      params.lng = location.lng;
      params.radius = location.radius;
      break;
    case EXPLORE_V2_PLACE_MODE.PLACE:
      params.place_id = location.place.id;
      break;
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
    case EXPLORE_V2_PLACE_MODE.UNINITIALIZED:
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
