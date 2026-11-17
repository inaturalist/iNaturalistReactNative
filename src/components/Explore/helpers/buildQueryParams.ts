import type { ExploreState } from "providers/ExploreContext";
import {
  EXPLORE_PLACE_MODE,
} from "providers/ExploreContext";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import type { ObservationOrderBy, SortDirection } from "types/sorting";

import type { FilterApiParams } from "./filtersToApiParams";
import filtersToApiParams from "./filtersToApiParams";

const PER_PAGE = 20;

export interface ExploreQueryParams extends FilterApiParams {
  per_page: number;
  order_by: ObservationOrderBy;
  order: SortDirection;
  taxon_id?: number;
  iconic_taxa?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  place_id?: number;
  swlat?: number;
  swlng?: number;
  nelat?: number;
  nelng?: number;
  verifiable?: boolean;
  identified?: boolean;
}

// sans the paging and sorting params that only apply to the observations search
export type ExploreBaseQueryParams = Omit<
  ExploreQueryParams,
  "order_by" | "order" | "per_page"
>;

export interface NearbyCoords {
  lat: number;
  lng: number;
  radius: number;
}

const buildExploreQueryParams = (
  state: ExploreState,
  nearbyCoords?: NearbyCoords,
  // The signed-in user's id, needed by the reviewed filter (viewer_id param).
  currentUserId?: number | null,
): ExploreQueryParams => {
  const params: ExploreQueryParams = {
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
    case "unknown":
      params.iconic_taxa = ["unknown"];
      params.identified = false;
      break;
    default:
      break;
  }

  const { location } = state;
  switch ( location.placeMode ) {
    case EXPLORE_PLACE_MODE.NEARBY:
      if ( nearbyCoords ) {
        params.lat = nearbyCoords.lat;
        params.lng = nearbyCoords.lng;
        params.radius = nearbyCoords.radius;
      }
      break;
    case EXPLORE_PLACE_MODE.PLACE:
      params.place_id = location.place.id;
      break;
    case EXPLORE_PLACE_MODE.MAP_AREA:
      params.swlat = location.bounds.swlat;
      params.swlng = location.bounds.swlng;
      params.nelat = location.bounds.nelat;
      params.nelng = location.bounds.nelng;
      break;
    case EXPLORE_PLACE_MODE.WORLDWIDE:
      break;
    default: {
      // Exhaustiveness check: ts fails if a new placeMode is added without a case.
      const _exhaustive: never = location;
      return _exhaustive;
    }
  }

  // Advanced Search filters
  const filterParams = filtersToApiParams( state.filters, currentUserId );
  const paramsWithFilters: ExploreQueryParams = {
    ...params,
    ...filterParams,
  };

  // `verifiable: true` excludes casual-grade observations
  // so drop it when the user explicitly asked for captive/casual
  if ( paramsWithFilters.quality_grade?.includes( "casual" ) || paramsWithFilters.captive ) {
    delete paramsWithFilters.verifiable;
  }

  return paramsWithFilters;
};

export default buildExploreQueryParams;
