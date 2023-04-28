// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import fetchTaxon from "api/taxa";
import {
  DisplayTaxonName, Heading4, ScrollViewWrapper, Tabs
} from "components/SharedComponents";
import { ImageBackground, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { IconButton, useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useTranslation from "sharedHooks/useTranslation";

import About from "./About";

const ABOUT_TAB_ID = "ABOUT";
const DATA_TAB_ID = "DATA";

const TaxonDetails = ( ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
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
          <HeaderBackButton
            tintColor={theme.colors.onPrimary}
            onPress={( ) => navigation.goBack( )}
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
          <IconButton
            icon="compass-rose-outline"
            onPress={( ) => navigation.navigate( "Explore" )}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            accessibilityRole="button"
            size={30}
            iconColor={theme.colors.onPrimary}
            disabled={false}
            accessibilityState={{ disabled: false }}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="m-0 ml-[-8px] bg-inatGreen"
          />
        </View>
      </ImageBackground>
      <Tabs tabs={tabs} activeId={currentTabId} />
      <About taxon={taxon} isLoading={isLoading} isError={isError} />
    </ScrollViewWrapper>
  );
};

export default TaxonDetails;
