// @flow

import classNames from "classnames";
import ExploreLocationSearchModal from "components/Explore/Modals/ExploreLocationSearchModal";
import ExploreTaxonSearchModal from "components/Explore/Modals/ExploreTaxonSearchModal";
import NumberBadge from "components/Explore/NumberBadge";
import {
  BackButton,
  Body3,
  DisplayTaxon,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { useExplore } from "providers/ExploreContext";
import type { Node } from "react";
import React, { useState } from "react";
import { Surface } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import placeGuessText from "../helpers/placeGuessText";
import ExploreHeaderCount from "./ExploreHeaderCount";

type Props = {
  count: ?number,
  exploreView: string,
  exploreViewIcon: string,
  hasLocationPermissions?: boolean,
  hideBackButton: boolean,
  isFetchingHeaderCount: boolean,
  onPressCount?: Function,
  openFiltersModal: Function,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function,
  updateLocation: Function,
  updateTaxon: Function
}

const Header = ( {
  count,
  exploreView,
  exploreViewIcon,
  hasLocationPermissions,
  hideBackButton,
  isFetchingHeaderCount,
  onPressCount,
  openFiltersModal,
  renderLocationPermissionsGate,
  requestLocationPermissions,
  updateLocation,
  updateTaxon
}: Props ): Node => {
  const { t } = useTranslation( );
  const { state, numberOfFilters } = useExplore( );
  const { taxon } = state;
  const iconicTaxonNames = state.iconic_taxa || [];
  const [showTaxonSearch, setShowTaxonSearch] = useState( false );
  const [showLocationSearch, setShowLocationSearch] = useState( false );

  const placeGuess = placeGuessText( state.placeMode, t, state.place_guess );

  const surfaceStyle = {
    backgroundColor: colors.darkGray,
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
              {( taxon || iconicTaxonNames.indexOf( "unknown" ) >= 0 )
                ? (
                  <DisplayTaxon
                    accessibilityLabel={t( "Change-taxon-filter" )}
                    taxon={taxon || "unknown"}
                    showInfoButton={false}
                    showCheckmark={false}
                    handlePress={() => setShowTaxonSearch( true )}
                  />
                )
                : (
                  <Pressable
                    accessibilityRole="button"
                    className="flex-row items-center"
                    onPress={() => setShowTaxonSearch( true )}
                  >
                    <INatIcon name="label-outline" size={15} />
                    <Body3
                      maxFontSizeMultiplier={1.5}
                      className="ml-3"
                    >
                      {t( "All-organisms" )}
                    </Body3>
                  </Pressable>
                )}
              <Pressable
                accessibilityRole="button"
                onPress={( ) => setShowLocationSearch( true )}
                className="flex-row items-center pt-3"
              >
                <INatIcon name="location" size={15} />
                <Body3 maxFontSizeMultiplier={1.5} className="ml-3">{placeGuess}</Body3>
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
        <ExploreHeaderCount
          count={count}
          exploreView={exploreView}
          exploreViewIcon={exploreViewIcon}
          isFetching={isFetchingHeaderCount}
          onPress={onPressCount}
        />
      </Surface>
      <ExploreTaxonSearchModal
        showModal={showTaxonSearch}
        closeModal={() => { setShowTaxonSearch( false ); }}
        updateTaxon={updateTaxon}
      />
      <ExploreLocationSearchModal
        closeModal={() => { setShowLocationSearch( false ); }}
        hasPermissions={hasLocationPermissions}
        renderPermissionsGate={renderLocationPermissionsGate}
        requestPermissions={requestLocationPermissions}
        showModal={showLocationSearch}
        updateLocation={updateLocation}
      />
    </View>
  );
};

export default Header;
