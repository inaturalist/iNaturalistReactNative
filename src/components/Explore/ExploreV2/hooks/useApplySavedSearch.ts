import { useNavigation } from "@react-navigation/native";
import countFilters from "components/Explore/ExploreV2/helpers/countFilters";
import type { ExploreStackScreenProps } from "navigation/types";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import { useCallback } from "react";
import type { ExploreV2AdvancedSearchSlice } from "stores/createExploreV2AdvancedSearchSlice";
import type { SavedSearch } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

const useApplySavedSearch = ( ) => {
  const { dispatch } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );
  const setAdvancedSearchMode = useStore(
    ( state: ExploreV2AdvancedSearchSlice ) => state.exploreV2AdvancedSearch.setAdvancedSearchMode,
  );

  return useCallback( ( search: SavedSearch ) => {
    dispatch( { type: EXPLORE_V2_ACTION.APPLY_SEARCH, search } );
    // Filters can only be edited on the advanced search screen, so a search that has them
    // sends the header's search button there
    if ( countFilters( search.filters ) > 0 ) { setAdvancedSearchMode( true ); }
    navigation.popTo( "ExploreResults" );
  }, [dispatch, navigation, setAdvancedSearchMode] );
};

export default useApplySavedSearch;
