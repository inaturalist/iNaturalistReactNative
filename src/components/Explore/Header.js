// @flow

import { useNavigation } from "@react-navigation/native";
import fetchSearchResults from "api/search";
import {
  Body1,
  Body3,
  Button,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import SearchBar from "components/SharedComponents/SearchBar";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  region: Object,
  setShowExploreBottomSheet: Function,
  exploreViewButtonText: string,
  headerRight?: ?string,
  setHeightAboveFilters: Function,
  updateTaxon: Function,
  updatePlace: Function,
  updatePlaceName: Function,
  exploreParams: Object,
  updateTaxonName: Function
}

const Header = ( {
  region, setShowExploreBottomSheet, exploreViewButtonText, headerRight,
  setHeightAboveFilters, updateTaxon, updatePlace, updatePlaceName, exploreParams,
  updateTaxonName
}: Props ): Node => {
  const { t } = useTranslation( );
  const taxonInput = useRef( );
  const placeInput = useRef( );
  const placeName = region.place_guess;
  const taxonName = exploreParams.taxon_name;
  const navigation = useNavigation( );
  const theme = useTheme( );
  const [hideTaxonResults, setHideTaxonResults] = useState( true );
  const [hidePlaceResults, setHidePlaceResults] = useState( true );

  const surfaceStyle = {
    backgroundColor: theme.colors.onPrimary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  };

  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonName],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonName,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );

  const { data: placeList } = useAuthenticatedQuery(
    ["fetchSearchResults", placeName],
    optsWithAuth => fetchSearchResults(
      {
        q: placeName,
        sources: "places",
        fields: "place,place.display_name,place.point_geojson"
      },
      optsWithAuth
    )
  );

  return (
    <View
      className="z-10 top-0 absolute w-full"
      onLayout={event => {
        const {
          height
        } = event.nativeEvent.layout;
        setHeightAboveFilters( height );
      }}
    >
      <Surface
        style={surfaceStyle}
        className="h-[175px]"
        elevation={5}
      >
        <View
          className="top-[15px] mx-5"
        >
          <View
            className="flex-row justify-between align-center"

          >
            <Button
              text={exploreViewButtonText}
              className="shrink"
              dropdown
              onPress={( ) => setShowExploreBottomSheet( true )}
            />
            {headerRight
              && (
                <View className="mt-4">
                  <Body1>{headerRight}</Body1>
                </View>
              )}
          </View>
          <View className="flex-row items-center">
            <INatIcon name="label-outline" size={15} />
            <SearchBar
              handleTextChange={taxonText => {
                if ( taxonInput?.current?.isFocused( ) ) {
                  setHideTaxonResults( false );
                  updateTaxonName( taxonText );
                }
              }}
              value={taxonName}
              testID="Explore.taxonSearch"
              containerClass="w-[250px]"
              input={taxonInput}
            />
          </View>
          <View className="bg-white">
            {!hideTaxonResults && taxonList?.map( taxon => (
              <Pressable
                accessibilityRole="button"
                key={taxon.id}
                className="p-2 border-[0.5px] border-lightGray flex-row items-center"
                onPress={( ) => {
                  updateTaxon( taxon );
                  setHideTaxonResults( true );
                  Keyboard.dismiss( );
                }}
              >
                <Image
                  source={{ uri: taxon?.default_photo?.url }}
                  className="w-[25px] h-[25px]"
                  accessibilityIgnoresInvertColors
                />
                <Body3 className="ml-2">{taxon?.preferred_common_name || taxon?.name}</Body3>
              </Pressable>
            ) )}
          </View>
          <View className="flex-row items-center">
            <INatIcon name="location" size={15} />
            <SearchBar
              handleTextChange={placeText => {
                if ( placeInput?.current?.isFocused( ) ) {
                  setHidePlaceResults( false );
                  updatePlaceName( placeText );
                }
              }}
              value={placeName}
              testID="Explore.placeSearch"
              containerClass="w-[250px]"
              input={placeInput}
            />
          </View>
          <View className="bg-white">
            {!hidePlaceResults && placeList?.map( place => (
              <Pressable
                accessibilityRole="button"
                key={place.id}
                className="p-2 border-[0.5px] border-lightGray flex-row items-center"
                onPress={( ) => {
                  updatePlace( place );
                  setHidePlaceResults( true );
                  Keyboard.dismiss( );
                }}
              >
                <Body3 className="ml-2">{place?.display_name}</Body3>
              </Pressable>
            ) )}
          </View>
          <View className="absolute right-0 bg-darkGray rounded-full" />
          <View className="absolute right-0 top-20 bg-darkGray rounded-md">
            <INatIconButton
              icon="sliders"
              color={colors.white}
              onPress={( ) => navigation.navigate( "ExploreFilters" )}
              accessibilityLabel={t( "Filters" )}
              accessibilityHint={t( "Navigates-to-explore" )}
            />
          </View>
        </View>
      </Surface>
    </View>
  );
};

export default Header;
