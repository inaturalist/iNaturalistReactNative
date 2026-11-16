import { useNavigation } from "@react-navigation/native";
import countFilters from "components/Explore/helpers/countFilters";
import type { ExploreStackScreenProps } from "navigation/types";
import { EXPLORE_ACTION, useExplore } from "providers/ExploreContext";
import { useCallback } from "react";
import type { SavedSearch } from "stores/createExploreSearchesSlice";
import useStore from "stores/useStore";

const useApplySavedSearch = ( ) => {
  const { dispatch } = useExplore( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );
  const setAdvancedSearchMode = useStore(
    state => state.exploreAdvancedSearch.setAdvancedSearchMode,
  );

  return useCallback( ( search: SavedSearch ) => {
    dispatch( { type: EXPLORE_ACTION.APPLY_SEARCH, search } );
    // Filters can only be edited on the advanced search screen, so a search that has them
    // sends the header's search button there
    if ( countFilters( search.filters ) > 0 ) { setAdvancedSearchMode( true ); }
    navigation.popTo( "ExploreResults" );
  }, [dispatch, navigation, setAdvancedSearchMode] );
};

export default useApplySavedSearch;
