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

  if (
    state.placeMode === EXPLORE_V2_PLACE_MODE.NEARBY
    && state.lat !== undefined
    && state.lng !== undefined
  ) {
    params.lat = state.lat;
    params.lng = state.lng;
    params.radius = state.radius;
  } else if (
    state.placeMode === EXPLORE_V2_PLACE_MODE.PLACE
    && state.place
  ) {
    params.place_id = state.place.id;
  }

  return params;
};

export default buildExploreV2QueryParams;
