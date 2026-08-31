import SavedSearchRow from "components/Explore/ExploreV2/components/SavedSearchRow";
import SearchSectionHeader
  from "components/Explore/ExploreV2/components/SearchSectionHeader";
import { View } from "components/styledComponents";
import React from "react";
import useTranslation from "sharedHooks/useTranslation";
import type { ExploreV2SearchesSlice, SavedSearch } from "stores/createExploreV2SearchesSlice";
import useStore from "stores/useStore";

interface Props {
  hideHeader?: boolean;
  onSelectSearch: ( _search: SavedSearch ) => void;
}

const SavedSearches = ( { hideHeader = false, onSelectSearch }: Props ) => {
  const { t } = useTranslation( );
  const searches: SavedSearch[] = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreSavedSearches.searches,
  );
  const removeSearch = useStore(
    ( state: ExploreV2SearchesSlice ) => state.exploreSavedSearches.removeSearch,
  );

  if ( searches.length === 0 ) { return null; }

  return (
    <View testID="SavedSearches">
      {!hideHeader && (
        <SearchSectionHeader
          icon="star"
          testID="SavedSearches.header"
          title={t( "Saved-searches" )}
        />
      )}
      {searches.map( search => (
        <SavedSearchRow
          key={search.key}
          onDelete={( ) => removeSearch( search.key )}
          onPress={( ) => onSelectSearch( search )}
          search={search}
        />
      ) )}
    </View>
  );
};

export default React.memo( SavedSearches );
