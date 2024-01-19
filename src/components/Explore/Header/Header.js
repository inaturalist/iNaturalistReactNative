// @flow

import fetchSearchResults from "api/search";
import {
  Body3,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import SearchBar from "components/SharedComponents/SearchBar";
import { Image, Pressable, View } from "components/styledComponents";
import { EXPLORE_ACTION, useExplore } from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

import HeaderCount from "./HeaderCount";

type Props = {
  count?: ?number,
  exploreView: string,
  exploreViewIcon: string,
  region: Object,
  updatePlace: Function,
  updatePlaceName: Function,
  updateTaxon: Function,
  openFiltersModal: Function,
}

const Header = ( {
  count,
  exploreView,
  exploreViewIcon,
  region,
  updatePlace,
  updatePlaceName,
  updateTaxon,
  openFiltersModal
}: Props ): Node => {
  const { t } = useTranslation( );
  const taxonInput = useRef( );
  const placeInput = useRef( );
  const placeName = region.place_guess;
  const theme = useTheme( );
  const { state, dispatch } = useExplore( );
  const taxonName = state.exploreParams.taxon_name;
  const [hideTaxonResults, setHideTaxonResults] = useState( true );
  const [hidePlaceResults, setHidePlaceResults] = useState( true );

  const surfaceStyle = {
    backgroundColor: theme.colors.primary,
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
    <View className="z-10">
      <Surface
        style={surfaceStyle}
        className="bg-darkGray"
        elevation={5}
      >
        <View className="bg-white px-5 flex-row justify-between items-center">
          <View>
            <View className="flex-row items-center">
              <INatIcon name="label-outline" size={15} />
              <SearchBar
                handleTextChange={taxonText => {
                  if ( taxonInput?.current?.isFocused( ) ) {
                    setHideTaxonResults( false );
                    dispatch( {
                      type: EXPLORE_ACTION.SET_TAXON_NAME,
                      taxonName: taxonText
                    } );
                  }
                }}
                value={taxonName || t( "All-organisms" )}
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
                value={placeName || t( "Worldwide" )}
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
          </View>
          <INatIconButton
            icon="sliders"
            color={colors.white}
            className="bg-darkGray rounded-md"
            onPress={() => openFiltersModal()}
            accessibilityLabel={t( "Filters" )}
            accessibilityHint={t( "Navigates-to-explore" )}
          />
        </View>
        <HeaderCount
          count={count}
          exploreView={exploreView}
          exploreViewIcon={exploreViewIcon}
        />
      </Surface>
    </View>
  );
};

export default Header;
