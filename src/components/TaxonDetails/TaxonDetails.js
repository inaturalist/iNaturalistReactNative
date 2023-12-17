// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchTaxon } from "api/taxa";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import PlaceholderText from "components/PlaceholderText";
import {
  BackButton,
  Heading4,
  HideView,
  INatIconButton,
  KebabMenu, ScrollViewWrapper,
  Tabs
} from "components/SharedComponents";
import {
  Image,
  LinearGradient,
  Pressable,
  View
} from "components/styledComponents";
import { compact } from "lodash";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { Linking, Share } from "react-native";
import { Menu, useTheme } from "react-native-paper";
import Photo from "realmModels/Photo";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

import About from "./About";
import TaxonDetailsMediaViewerHeader from "./TaxonDetailsMediaViewerHeader";
import TaxonDetailsTitle from "./TaxonDetailsTitle";

const logger = log.extend( "TaxonDetails" );

const { useRealm } = RealmContext;

const ABOUT_TAB_ID = "ABOUT";
const DATA_TAB_ID = "DATA";

const TAXON_URL = "https://www.inaturalist.org/taxa";

const TaxonDetails = ( ): Node => {
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const { t } = useTranslation( );
  const [currentTabId, setCurrentTabId] = useState( ABOUT_TAB_ID );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );

  const realm = useRealm( );
  const localTaxon = realm.objectForPrimaryKey( "Taxon", id );

  // Note that we want to authenticate this to localize names, desc language, etc.
  const {
    data: remoteTaxon,
    isLoading,
    isError,
    error
  } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, {}, optsWithAuth )
  );
  if ( error ) {
    logger.error( `Failed to retrieve taxon ${id}: ${error}` );
  }
  const taxon = remoteTaxon || localTaxon;
  const taxonUrl = `${TAXON_URL}/${taxon.id}`;

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

  const photos = compact(
    taxon?.taxonPhotos
      ? taxon.taxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );

  const renderHeader = useCallback( ( { onClose } ) => (
    <TaxonDetailsMediaViewerHeader
      taxon={taxon}
      onClose={onClose}
    />
  ), [taxon] );

  const openURLInBrowser = async url => {
    try {
      const canOpen = await Linking.canOpenURL( url );

      if ( canOpen ) {
        await Linking.openURL( url );
      } else {
        console.error( "Cannot open URL" );
      }
    } catch ( exc ) {
      console.error( "An error occurred", exc );
    }
  };

  return (
    <ScrollViewWrapper testID={`TaxonDetails.${taxon?.id}`}>
      <View
        className="w-full h-[420px] mb-5"
      >
        <Pressable
          onPress={() => setMediaViewerVisible( true )}
          accessibilityLabel={t( "View-photo" )}
          accessibilityRole="link"
        >
          <Image
            testID="TaxonDetails.photo"
            className="w-full h-full"
            source={{
              uri: Photo.displayMediumPhoto( photos.at( 0 )?.url )
            }}
            accessibilityIgnoresInvertColors
          />
          <LinearGradient
            colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5) 100%)"]}
            className="absolute w-full h-full"
          />
        </Pressable>
        <View className="absolute left-5 top-5">
          <BackButton
            color={theme.colors.onPrimary}
            onPress={( ) => navigation.goBack( )}
          />
        </View>

        <View className="absolute right-5 top-5">
          <KebabMenu
            visible={kebabMenuVisible}
            setVisible={setKebabMenuVisible}
            large
            white
          >
            <Menu.Item
              onPress={( ) => {
                openURLInBrowser( taxonUrl );
                setKebabMenuVisible( false );
              }}
              title={t( "View-in-browser" )}
            />
            <Menu.Item
              onPress={( ) => {
                Share.share( {
                  message: taxonUrl,
                  url: taxonUrl
                } );
                setKebabMenuVisible( false );
              }}
              title={t( "Share" )}
            />
          </KebabMenu>
        </View>
        <View className="absolute bottom-0 p-5 w-full flex-row items-center">
          <TaxonDetailsTitle taxon={taxon} optionalClasses="text-white" />
          <INatIconButton
            icon="compass-rose-outline"
            onPress={( ) => navigation.navigate( "TabNavigator", {
              screen: "ObservationsStackNavigator",
              params: {
                screen: "Explore"
              }
            } )}
            accessibilityLabel={t( "Explore" )}
            accessibilityHint={t( "Navigates-to-explore" )}
            size={30}
            color={theme.colors.onPrimary}
            // FWIW, IconButton has a little margin we can control and a
            // little padding that we can't control, so the negative margin
            // here is to ensure the visible icon is flush with the edge of
            // the container
            className="ml-5 bg-inatGreen rounded-full"
          />
        </View>
      </View>
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
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={( ) => setMediaViewerVisible( false )}
        photos={photos}
        header={renderHeader}
      />
    </ScrollViewWrapper>
  );
};

export default TaxonDetails;
