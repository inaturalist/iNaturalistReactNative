import {
  Body2,
  INatIcon,
  SearchBar,
  TaxaList,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import Taxon from "realmModels/Taxon";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4
} );

interface Props {
  header: React.FC;
  query?: string;
  setQuery: ( newQuery: string ) => void;
  isLoading?: boolean;
  isLocal?: boolean;
  renderItem: ( { item: Taxon, index: number } ) => React.FC;
  taxa: Taxon[]
}

const TaxonSearch = ( {
  header,
  isLoading = false,
  isLocal = false,
  query = "",
  renderItem,
  setQuery,
  taxa = []
}: Props ) => {
  const { t } = useTranslation( );
  return (
    <ViewWrapper>
      {header}
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
            <INatIcon
              name="offline"
              size={34}
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Body2 className="flex-1">
              { t( "Showing-offline-search-results--taxa" )}
            </Body2>
          </View>
        ) }
      </View>
      {/* TODO move TaxaList logic here. This is the only place we call it */}
      <TaxaList
        taxa={taxa}
        isLoading={isLoading}
        renderItem={renderItem}
        taxonQuery={query}
      />
    </ViewWrapper>
  );
};

export default TaxonSearch;
