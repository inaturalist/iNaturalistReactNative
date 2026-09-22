import { act } from "@testing-library/react-native";
import savedSearchKey from "components/Explore/ExploreV2/helpers/savedSearchKey";
import { defaultExploreV2Filters, EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { SPECIES_SORT } from "sharedHelpers/speciesSort";
import useStore from "stores/useStore";

export const taxonSubject = id => ( { type: "taxon", taxon: { id, name: `Taxon ${id}` } } );

export const place = id => ( { id, display_name: `Place ${id}`, place_type: 9 } );

// Builds a saved search the way the screen does, computing the key from the search itself so
// tests never have to keep a key in step with the search it identifies by hand
export const savedSearch = ( overrides = {} ) => {
  const { savedAt = 1, ...searchOverrides } = overrides;
  const search = {
    subject: taxonSubject( 12 ),
    location: { placeMode: EXPLORE_V2_PLACE_MODE.WORLDWIDE },
    sortBy: OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST,
    speciesSortBy: SPECIES_SORT.COUNT_DESC,
    filters: defaultExploreV2Filters,
    ...searchOverrides,
  };
  return { ...search, key: savedSearchKey( search ), savedAt };
};

// Seeds the store with saved searches, the one place in the suite that reaches into the slice
export const setSavedSearches = searches => act( ( ) => {
  useStore.setState( state => ( {
    exploreSavedSearches: { ...state.exploreSavedSearches, searches },
  } ) );
} );
