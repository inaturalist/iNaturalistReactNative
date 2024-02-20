// @flow

import { useNavigation } from "@react-navigation/native";
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
  count: ?number,
  exploreView: string,
  exploreViewIcon: string,
  openFiltersModal: Function,
  updateTaxon: Function
}

const Header = ( {
  count,
  exploreView,
  exploreViewIcon,
  openFiltersModal,
  updateTaxon
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const taxonInput = useRef( );
  const theme = useTheme( );
  const { state, dispatch } = useExplore( );
  const taxonName = state.taxon_name;
  const placeName = state.place_guess || t( "Worldwide" );
  const [hideTaxonResults, setHideTaxonResults] = useState( true );

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
                value={taxonName}
                placeholder={t( "All-organisms" )}
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
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center"
              onPress={( ) => navigation.navigate( "ExploreLocationSearch" )}
            >
              <INatIcon name="location" size={15} />
              <Body3 className="m-3">{placeName}</Body3>
            </Pressable>
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
