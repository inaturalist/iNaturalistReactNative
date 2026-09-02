import { useNavigation } from "@react-navigation/native";
import SavedSearchRow from "components/Explore/ExploreV2/components/SavedSearchRow";
import SearchSectionHeader
  from "components/Explore/ExploreV2/components/SearchSectionHeader";
import countFilters from "components/Explore/ExploreV2/helpers/countFilters";
import { View } from "components/styledComponents";
import type { ExploreStackScreenProps } from "navigation/types";
import { EXPLORE_V2_ACTION, useExploreV2 } from "providers/ExploreV2Context";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import type { ExploreV2AdvancedSearchSlice } from "stores/createExploreV2AdvancedSearchSlice";
import type { ExploreV2SearchesSlice, SavedSearch } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

interface Props {
  hideHeader?: boolean;
}

const SavedSearches = ( { hideHeader = false }: Props ) => {
  const { t } = useTranslation( );
  const { dispatch } = useExploreV2( );
  const navigation = useNavigation<ExploreStackScreenProps<"ExploreResults">["navigation"]>( );
  const searches: SavedSearch[] = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreSavedSearches.searches,
  );
  const removeSearch = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreSavedSearches.removeSearch,
  );
  const setAdvancedSearchMode = useStore(
    ( state: ExploreV2AdvancedSearchSlice ) => state.exploreV2AdvancedSearch.setAdvancedSearchMode,
  );

  const applySearch = ( search: SavedSearch ) => {
    dispatch( { type: EXPLORE_V2_ACTION.APPLY_SEARCH, search } );
    // Filters can only be edited on the advanced search screen, so a search that has them
    // sends the header's search button there
    if ( countFilters( search.filters ) > 0 ) { setAdvancedSearchMode( true ); }
    navigation.popTo( "ExploreResults" );
  };

  if ( searches.length === 0 ) { return null; }

  return (
    <View testID="SavedSearches">
      {!hideHeader && (
        <SearchSectionHeader
          icon="star-bold-outline"
          testID="SavedSearches.header"
          title={t( "Saved-searches" )}
        />
      )}
      {searches.map( search => (
        <SavedSearchRow
          key={search.key}
          onDelete={( ) => removeSearch( search.key )}
          onPress={( ) => applySearch( search )}
          search={search}
        />
      ) )}
    </View>
  );
};

export default React.memo( SavedSearches );
