import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import classnames from "classnames";
import ExploreSearchHeader from "components/Explore/SearchScreens/ExploreSearchHeader";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import INatIcon from "components/SharedComponents/INatIcon";
import UnderlinedLink from "components/SharedComponents/Typography/UnderlinedLink";
import ViewWrapper from "components/SharedComponents/ViewWrapper";
import {
  TextInput,
  View,
} from "components/styledComponents";
import type { ExploreStackParamList } from "navigation/types";
import React, { useState } from "react";
import { Keyboard } from "react-native";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadow( );

const UniversalSearch = ( ) => {
  const navigation = useNavigation<NativeStackNavigationProp<ExploreStackParamList>>( );
  const { t } = useTranslation( );

  const [taxonText, setTaxonText] = useState( "" );
  const [locationText, setLocationText] = useState( "" );

  const bothFilled = taxonText.length > 0 && locationText.length > 0;

  const handleReset = ( ) => {
    setTaxonText( "" );
    setLocationText( "" );
  };

  const handleSearch = ( ) => {
    // TODO MOB-1338 follow-up: run the search (default to all organisms /
    // worldwide when a field is empty). Just dismiss the keyboard for now.
    Keyboard.dismiss( );
  };

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
            <View className="flex-1 border border-lightGray rounded-lg">
              <View className="flex-row items-center px-3 h-[44px]">
                <INatIcon name="magnifying-glass" size={18} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-species-user-or-project" )}
                  className="flex-1 ml-2 text-base"
                  numberOfLines={1}
                  onChangeText={setTaxonText}
                  placeholder={t( "Search-for-species-user-or-project" )}
                  placeholderTextColor={colors.mediumGray}
                  testID="UniversalSearch.taxonInput"
                  value={taxonText}
                />
              </View>
              <View className="border-t border-lightGray" />
              <View className="flex-row items-center px-3 h-[44px]">
                <INatIcon name="map-marker-outline" size={18} color={colors.darkGray} />
                <TextInput
                  accessibilityLabel={t( "Search-for-a-location" )}
                  className="flex-1 ml-2 text-base"
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
              <INatIconButton
                accessibilityLabel={t( "Search" )}
                onPress={handleSearch}
                testID="UniversalSearch.searchButton"
              >
                <View
                  className={classnames(
                    "w-10 h-10 rounded-md items-center justify-center",
                    bothFilled
                      ? "bg-inatGreen"
                      : "bg-darkGray",
                  )}
                >
                  <INatIcon name="magnifying-glass" size={20} color={colors.white} />
                </View>
              </INatIconButton>
            </View>
          </View>
          <View className="mt-3 items-end">
            <UnderlinedLink onPress={( ) => navigation.navigate( "AdvancedSearch" )}>
              {t( "Advanced-Search" )}
            </UnderlinedLink>
          </View>
        </View>
      </View>
    </ViewWrapper>
  );
};

export default UniversalSearch;
