// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchTaxon } from "api/taxa";
import PlaceholderText from "components/PlaceholderText";
import {
  DisplayTaxonName,
  Heading4,
  HideView,
  INatIconButton,
  ScrollViewWrapper,
  Tabs
} from "components/SharedComponents";
import BackButton from "components/SharedComponents/Buttons/BackButton";
import { ImageBackground, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import About from "./About";

const ABOUT_TAB_ID = "ABOUT";
const DATA_TAB_ID = "DATA";

const TaxonDetails = ( ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const lastScreen = params?.lastScreen;
  const { t } = useTranslation( );
  const [currentTabId, setCurrentTabId] = useState( ABOUT_TAB_ID );

  // Note that we want to authenticate this to localize names, desc language, etc.
  const { data, isLoading, isError } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, {}, optsWithAuth )
  );
  const taxon = data;

  const tabs = [
    {
      id: ABOUT_TAB_ID,
      testID: "TaxonDetails.AboutTab",
      onPress: () => setCurrentTabId( ABOUT_TAB_ID ),
      text: t( "ABOUT" )
    },
    {
      id: DATA_TAB_ID,
      testID: "TaxonDetails.DataTab",
      onPress: () => setCurrentTabId( DATA_TAB_ID ),
      text: t( "DATA" )
    }
  ];

  if ( !taxon ) {
    return null;
  }

  return (
    <ScrollViewWrapper testID={`TaxonDetails.${taxon?.id}`}>
      <ImageBackground
        testID="TaxonDetails.photo"
        className="w-full h-[420px] mb-5"
        source={{ uri: Photo.displayMediumPhoto( taxon.taxonPhotos[0].photo.url ) }}
        accessibilityIgnoresInvertColors
      >
        <View className="absolute left-5 top-5">
          <BackButton
            color={theme.colors.onPrimary}
            onPress={( ) => {
              if ( lastScreen ) {
                navigation.navigate( "CameraNavigator", {
                  screen: "AddID",
                  params: { }
                } );
              } else {
                navigation.goBack( );
              }
            }}
          />
        </View>
        <View className="absolute bottom-5 left-5">
          <Heading4 className="color-white">{taxon.rank}</Heading4>
          <DisplayTaxonName
            taxon={taxon}
            layout="horizontal"
            color="text-white"
          />
        </View>
        <View className="absolute bottom-5 right-5">
          <INatIconButton
            icon="compass-rose-outline"
            onPress={( ) => navigation.navigate( "Explore" )}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            size={30}
            color={theme.colors.onPrimary}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="m-0 ml-[-8px] bg-inatGreen rounded-full"
          />
        </View>
      </ImageBackground>
      <Tabs tabs={tabs} activeId={currentTabId} />
      <HideView show={currentTabId === ABOUT_TAB_ID}>
        <About taxon={taxon} isLoading={isLoading} isError={isError} />
      </HideView>
      <HideView noInitialRender show={currentTabId === DATA_TAB_ID}>
        <View className="m-3">
          <Heading4>{ t( "MY-OBSERVATIONS" ) }</Heading4>
          <PlaceholderText text="TODO" />
          <Heading4>{ t( "GRAPHS" ) }</Heading4>
          <PlaceholderText text="TODO" />
          <Heading4>{ t( "TOP-OBSERVERS" ) }</Heading4>
          <PlaceholderText text="TODO" />
          <Heading4>{ t( "TOP-IDENTIFIERS" ) }</Heading4>
          <PlaceholderText text="TODO" />
        </View>
      </HideView>
    </ScrollViewWrapper>
  );
};

export default TaxonDetails;
