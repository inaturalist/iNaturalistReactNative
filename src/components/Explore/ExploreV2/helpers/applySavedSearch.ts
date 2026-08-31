import type { ExploreV2Action } from "providers/ExploreV2Context";
import { EXPLORE_V2_ACTION, EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import type { SavedSearch } from "stores/createExploreV2SearchesSlice";

const applySavedSearch = (
  search: SavedSearch,
  dispatch: ( _action: ExploreV2Action ) => void,
): void => {
  const { location } = search;

  dispatch( search.subject
    ? { type: EXPLORE_V2_ACTION.SET_SUBJECT, subject: search.subject }
    : { type: EXPLORE_V2_ACTION.CLEAR_SUBJECT } );

  switch ( location.placeMode ) {
    case EXPLORE_V2_PLACE_MODE.PLACE:
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_PLACE, place: location.place } );
      break;
    case EXPLORE_V2_PLACE_MODE.MAP_AREA:
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_MAP_AREA, bounds: location.bounds } );
      break;
    case EXPLORE_V2_PLACE_MODE.NEARBY:
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_NEARBY } );
      break;
    case EXPLORE_V2_PLACE_MODE.WORLDWIDE:
      dispatch( { type: EXPLORE_V2_ACTION.SET_LOCATION_WORLDWIDE } );
      break;
    default: {
      const _exhaustive: never = location;
      break;
    }
  }

  dispatch( { type: EXPLORE_V2_ACTION.SET_SORT, sortBy: search.sortBy } );
  dispatch( {
    type: EXPLORE_V2_ACTION.SET_SPECIES_SORT,
    speciesSortBy: search.speciesSortBy,
  } );
  dispatch( { type: EXPLORE_V2_ACTION.SET_FILTERS, filters: search.filters } );
};

export default applySavedSearch;
