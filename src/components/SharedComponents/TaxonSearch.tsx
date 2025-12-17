import EmptySearchResults from "components/Explore/SearchScreens/EmptySearchResults";
import {
  Body2,
  INatIcon,
  SearchBar,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import type { RealmTaxon } from "realmModels/types";
import { useKeyboardInfo, useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

interface Props {
  query?: string;
  setQuery: ( newQuery: string ) => void;
  isLoading?: boolean;
  isLocal?: boolean;
  renderItem: (
    { item, index }: { item: RealmTaxon; index: number }
  ) => React.ReactElement<unknown>;
  taxa: RealmTaxon[];
}

const TaxonSearch = ( {
  isLoading = false,
  isLocal = false,
  query = "",
  renderItem,
  setQuery,
  taxa = []
}: Props ) => {
  const { t } = useTranslation( );
  const { keyboardHeight, keyboardShown } = useKeyboardInfo( );

  const renderEmptyList = useCallback( ( ) => (
    query.length > 0
      ? (
        <EmptySearchResults
          isLoading={isLoading}
          searchQuery="does it matter?"
          skipOfflineNotice
        />
      )
      : null
  ), [query.length, isLoading] );

  // Make sure all of the results can be scrolled to even with the keyboard
  // up
  const renderFooter = useCallback( ( ) => (
    keyboardShown
      ? <View className={`h-[${keyboardHeight}px]`} />
      : null
  ), [keyboardHeight, keyboardShown] );

  return (
    <ViewWrapper useTopInset={false}>
      <View
        className="bg-white px-6 pt-2 pb-[21px]"
        style={DROP_SHADOW}
      >
        <SearchBar
          handleTextChange={setQuery}
          value={query}
          testID="SearchTaxon"
          autoFocus={query === ""}
        />
        { isLocal && (
          <View className="flex-row items-center space-x-[19px] mt-[21px]">
            <View accessibilityElementsHidden importantForAccessibility="no" aria-hidden>
              <INatIcon name="offline" size={34} />
            </View>
            <Body2 className="flex-1">
              { t( "Showing-offline-search-results--taxa" )}
            </Body2>
          </View>
        ) }
      </View>
      <FlatList
        keyboardShouldPersistTaps="always"
        data={taxa}
        renderItem={renderItem}
        keyExtractor={taxon => String( taxon.id )}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
