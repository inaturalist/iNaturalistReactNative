// @flow

import { useNavigation } from "@react-navigation/native";
import classNames from "classnames";
import NumberBadge from "components/Explore/NumberBadge.tsx";
import {
  BackButton,
  Body3,
  DisplayTaxon,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { useExplore } from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React from "react";
import { Surface, useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import HeaderCount from "./HeaderCount";

type Props = {
  count: ?number,
  exploreView: string,
  exploreViewIcon: string,
  hideBackButton: boolean,
  loadingStatus: boolean,
  onPressCount?: Function,
  openFiltersModal: Function
}

const Header = ( {
  count,
  exploreView,
  exploreViewIcon,
  hideBackButton,
  loadingStatus,
  onPressCount,
  openFiltersModal
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const theme = useTheme( );
  const { state, numberOfFilters } = useExplore( );
  const { taxon } = state;
  const placeGuess = state.place_guess;

  const surfaceStyle = {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: -40
  };

  return (
    <View className="z-10">
      <Surface style={surfaceStyle} elevation={5}>
        <View className="bg-white px-6 py-4 flex-row justify-between items-center">
          <View className="flex-1 flex-row">
            {!hideBackButton && (
              <BackButton
                inCustomHeader
                testID="Explore.BackButton"
              />
            ) }
            <View className="flex-1">
              {taxon
                ? (
                  <DisplayTaxon
                    accessibilityLabel={t( "Change-taxon-filter" )}
                    taxon={taxon}
                    handlePress={() => navigation.navigate( "ExploreTaxonSearch" )}
                  />
                )
                : (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center"
                    onPress={() => navigation.navigate( "ExploreTaxonSearch" )}
                  >
                    <INatIcon name="label-outline" size={15} />
                    <Body3 className="ml-3">{t( "All-organisms" )}</Body3>
                  </Pressable>
                )}
              <Pressable
                accessibilityRole="button"
                onPress={( ) => navigation.navigate( "ExploreLocationSearch" )}
                className="flex-row items-center pt-3"
              >
                <INatIcon name="location" size={15} />
                <Body3 className="ml-3">{placeGuess}</Body3>
              </Pressable>
            </View>
          </View>
          <View>
            <INatIconButton
              icon="sliders"
              color={colors.white}
              className={classNames(
                numberOfFilters !== 0
                  ? "bg-inatGreen"
                  : "bg-darkGray",
                "rounded-md"
              )}
              onPress={() => openFiltersModal()}
              accessibilityLabel={t( "Filters" )}
              accessibilityHint={t( "Navigates-to-explore" )}
            />
            {numberOfFilters !== 0 && (
              <View className="absolute top-[-10] right-[-10]">
                <NumberBadge number={numberOfFilters} light />
              </View>
            )}
          </View>
        </View>
        <HeaderCount
          count={count}
          exploreView={exploreView}
          exploreViewIcon={exploreViewIcon}
          loadingStatus={loadingStatus}
          onPress={onPressCount}
        />
      </Surface>
    </View>
  );
};

export default Header;
