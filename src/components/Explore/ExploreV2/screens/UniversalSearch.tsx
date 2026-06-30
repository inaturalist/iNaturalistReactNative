import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import ExploreSearchHeader from "components/Explore/SearchScreens/ExploreSearchHeader";
import ContainedSquareButton from "components/SharedComponents/Buttons/ContainedSquareButton";
import INatIcon from "components/SharedComponents/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import {
  TextInput,
  View,
} from "components/styledComponents";
import type { ExploreStackScreenProps } from "navigation/types";
import React, { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

// Underlining via style instead className prop seemed to override other styling
const UNDERLINE_STYLE = { textDecorationLine: "underline" } as const;

const INPUT_BOX_CLASSES = classnames(
  "flex-row items-center px-3 h-[44px]",
  "border border-lightGray rounded-lg",
);

const UniversalSearch = ( ) => {
  const navigation = useNavigation<ExploreStackScreenProps<"UniversalSearch">["navigation"]>( );
  const { t } = useTranslation( );

  const [taxonText, setTaxonText] = useState( "" );
  const [locationText, setLocationText] = useState( "" );

  const bothFilled = taxonText.length > 0 && locationText.length > 0;

  const handleReset = useCallback( ( ) => {
    setTaxonText( "" );
    setLocationText( "" );
  }, [] );

  const handleSearch = useCallback( ( ) => {
    // TODO MOB-1338 follow-up: run the search (default to all organisms /
    // worldwide when a field is empty). Just dismiss the keyboard for now.
    Keyboard.dismiss( );
  }, [] );

  return (
    <ViewWrapper testID="UniversalSearch">
      <View className="bg-white" style={DROP_SHADOW}>
        <ExploreSearchHeader
          headerText={t( "SEARCH" )}
          closeModal={navigation.goBack}
          resetFilters={handleReset}
          testID="UniversalSearch.back"
        />
        <View className="px-4 pb-4">
          <View className="flex-row items-center">
            <View className="flex-1">
              <View className={INPUT_BOX_CLASSES}>
                <INatIcon name="magnifying-glass" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-species-user-or-project" )}
                  autoFocus
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={setTaxonText}
                  placeholder={t( "Search-for-species-user-or-project" )}
                  placeholderTextColor={colors.mediumGray}
                  testID="UniversalSearch.taxonInput"
                  value={taxonText}
                />
              </View>
              <View className={classnames( INPUT_BOX_CLASSES, "-mt-px" )}>
                <INatIcon name="map-marker-outline" size={15} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-a-location" )}
                  className="flex-1 ml-2 text-md font-Lato-Regular"
                  numberOfLines={1}
                  onChangeText={setLocationText}
                  placeholder={t( "Search-for-a-location" )}
                  placeholderTextColor={colors.mediumGray}
                  testID="UniversalSearch.locationInput"
                  value={locationText}
                />
              </View>
            </View>
            <View className="ml-3">
              <ContainedSquareButton
                accessibilityLabel={t( "Search" )}
                backgroundColor={bothFilled
                  ? colors.inatGreen
                  : colors.darkGray}
                icon="magnifying-glass"
                onPress={handleSearch}
                testID="UniversalSearch.searchButton"
              />
            </View>
          </View>
          <View className="mt-3 items-end">
            <Body3
              onPress={( ) => navigation.navigate( "AdvancedSearch" )}
              style={UNDERLINE_STYLE}
            >
              {t( "Advanced-Search" )}
            </Body3>
          </View>
        </View>
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
