import {
  Body3,
  INatIconButton,
} from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import {
  MY_OBSERVATIONS_ACTION,
  useMyObservations,
} from "providers/MyObservationsContext";
import React from "react";
import { useTranslation } from "sharedHooks";

const SearchedTaxonBanner = ( ) => {
  const { t } = useTranslation( );
  const { state, dispatch } = useMyObservations( );
  const { searchedTaxon } = state;

  if ( !searchedTaxon ) return null;

  const displayName = searchedTaxon.preferredCommonName || searchedTaxon.name;

  return (
    <View
      className="flex-row items-center bg-white space-x-[20px]"
      testID="SearchedTaxonBanner"
    >
      <View className="flex-1 flex-row items-center space-x-[10px]">
        <View className="w-[44px] h-[44px] bg-lightGray">
          {searchedTaxon.iconUri && (
            <Image
              source={{ uri: searchedTaxon.iconUri }}
              className="w-full h-full"
              accessibilityIgnoresInvertColors
            />
          )}
        </View>
        <Body3 className="flex-1" numberOfLines={1}>
          {displayName}
        </Body3>
      </View>
      <INatIconButton
        icon="close"
        size={14}
        accessibilityLabel={t( "Close-search" )}
        onPress={( ) => dispatch( {
          type: MY_OBSERVATIONS_ACTION.CLEAR_TAXON_SEARCH,
        } )}
      />
    </View>
  );
};

export default SearchedTaxonBanner;
