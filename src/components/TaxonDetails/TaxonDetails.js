// @flow

import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { fetchTaxon } from "api/taxa";
import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  ActivityIndicator,
  BackButton,
  Body2,
  Button,
  INatIcon,
  INatIconButton,
  KebabMenu,
  ScrollViewWrapper,
  StickyToolbar
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import _, { compact } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Share,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useTheme } from "react-native-paper";
import { log } from "sharedHelpers/logger";
import {
  useAuthenticatedQuery, useCurrentUser, useLastScreen,
  useTranslation, useUserMe
} from "sharedHooks";
import useStore from "stores/useStore";

import EstablishmentMeans from "./EstablishmentMeans";
import TaxonDetailsMediaViewerHeader from "./TaxonDetailsMediaViewerHeader";
import TaxonDetailsTitle from "./TaxonDetailsTitle";
import TaxonMapPreview from "./TaxonMapPreview";
import TaxonMedia from "./TaxonMedia";
import Taxonomy from "./Taxonomy";
import Wikipedia from "./Wikipedia";

const logger = log.extend( "TaxonDetails" );

const { useRealm } = RealmContext;

const TAXON_URL = "https://www.inaturalist.org/taxa";

const isTablet = DeviceInfo.isTablet();

const TaxonDetails = ( ): Node => {
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const setExploreView = useStore( state => state.setExploreView );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id, hideNavButtons } = params;
  const { t } = useTranslation( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const { remoteUser } = useUserMe( );
  const [kebabMenuVisible, setKebabMenuVisible] = useState( false );
  const [mediaIndex, setMediaIndex] = useState( 0 );
  const navState = useNavigationState( nav => nav );
  const history = navState?.routes.map( r => r.name );
  const lastScreen = useLastScreen( );
  const fromObsDetails = _.includes( history, "ObsDetails" );
  const prevScreenSuggestions = lastScreen === "Suggestions";
  const prevScreenTaxonSearch = lastScreen === "TaxonSearch";
  const prevScreenTaxonDetails = lastScreen === "TaxonDetails";
  const currentUser = useCurrentUser( );

  const reversedHistory = _.reverse( history );
  let cameFromSuggestionsOrSearch = false;

  reversedHistory?.forEach( ( screen, index ) => {
    if ( screen !== "TaxonDetails" ) {
      if ( screen === "Suggestions" || screen === "TaxonSearch" ) {
        if ( reversedHistory[index - 1] === "TaxonDetails" ) {
          // see if previous index was taxon details
          cameFromSuggestionsOrSearch = true;
        }
      }
    }
  } );

  const isTaxonDetailsFromSuggestions = prevScreenTaxonDetails && cameFromSuggestionsOrSearch;

  // previous ObsDetails observation uuid
  const obsUuid = fromObsDetails
    ? _.find( navState?.routes, r => r.name === "ObsDetails" ).params.uuid
    : null;

  const showSelectButton = currentUser
    && ( prevScreenSuggestions || prevScreenTaxonSearch || isTaxonDetailsFromSuggestions );
  const usesVision = prevScreenSuggestions
    && !prevScreenTaxonSearch
    && !isTaxonDetailsFromSuggestions;

  const realm = useRealm( );
  const localTaxon = realm.objectForPrimaryKey( "Taxon", id );

  const taxonFetchParams = {
    place_id: remoteUser?.place_id
  };

  // Note that we want to authenticate this to localize names, desc language, etc.
  const {
    data: remoteTaxon,
    isLoading,
    isError,
    error
  } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxon( id, taxonFetchParams, optsWithAuth )
  );
  if ( error ) {
    logger.error( `Failed to retrieve taxon ${id}: ${error}` );
  }
  const taxon = remoteTaxon || localTaxon;
  const taxonUrl = `${TAXON_URL}/${taxon?.id}`;

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

  const displayTaxonDetails = ( ) => {
    if ( isLoading ) {
      return <View className="m-3 flex-1 h-full"><ActivityIndicator /></View>;
    }

    if ( isError || !taxon ) {
      return (
        <View className="m-3">
          <Body2>{t( "Error-Could-Not-Fetch-Taxon" )}</Body2>
        </View>
      );
    }

    return (
      <View className="mx-3 mb-3">
        <EstablishmentMeans taxon={taxon} />
        <Wikipedia taxon={taxon} />
        <Taxonomy taxon={taxon} hideNavButtons={hideNavButtons} />
        <TaxonMapPreview taxon={taxon} />
      </View>
    );
  };

  return (
    <>
      <ScrollViewWrapper
        testID={`TaxonDetails.${taxon?.id}`}
        className="bg-black"
      >
        {/*
        Making the bar dark here seems like the right thing, but I haven't
        figured a way to do that *and* not making the bg of the scrollview
        black, which reveals a dark area at the bottom of the screen on
        overscroll in iOS ~~~kueda20240228
      */}
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View className="flex-1 h-full bg-black">
          <View className="w-full h-[420px] shrink-1">
            <View className="absolute left-4 top-4 z-10">
              <BackButton color="white" />
            </View>
            <TaxonMedia
              loading={isLoading}
              photos={photos}
              tablet={isTablet}
              onChangeIndex={setMediaIndex}
            />
            {!hideNavButtons && (
              <View className="absolute right-4 top-1">
                <KebabMenu
                  visible={kebabMenuVisible}
                  setVisible={setKebabMenuVisible}
                  large
                  white
                >
                  <KebabMenu.Item
                    testID="MenuItem.OpenInBrowser"
                    onPress={( ) => {
                      openURLInBrowser( taxonUrl );
                      setKebabMenuVisible( false );
                    }}
                    title={t( "View-in-browser" )}
                  />
                  <KebabMenu.Item
                    testID="MenuItem.Share"
                    onPress={async ( ) => {
                      const sharingOptions = {
                        url: "",
                        message: ""
                      };

                      if ( Platform.OS === "ios" ) {
                        sharingOptions.url = taxonUrl;
                      } else {
                        sharingOptions.message = taxonUrl;
                      }

                      setKebabMenuVisible( false );

                      try {
                        return await Share.share( sharingOptions );
                      } catch ( err ) {
                        Alert.alert( err.message );
                        return null;
                      }
                    }}
                    title={t( "Share" )}
                  />
                </KebabMenu>
              </View>
            )}
            <View
              className="absolute bottom-0 p-0 w-full"
              pointerEvents="box-none"
            >
              {!isTablet && photos.length > 1 && (
                <View
                  className="flex flex-row w-full justify-center items-center mb-3"
                  pointerEvents="none"
                >
                  { photos.map( ( item, idx ) => (
                    <View
                      key={`dot-${item.id}`}
                      className={classnames(
                        "rounded-full bg-white m-[2.5]",
                        idx === mediaIndex
                          ? "w-[4px] h-[4px]"
                          : "w-[2px] h-[2px]"
                      )}
                    />
                  ) )}
                </View>
              )}
              <View
                className="w-full flex-row items-center pl-5 pr-5 pb-5"
                pointerEvents="box-none"
              >
                <TaxonDetailsTitle taxon={taxon} optionalClasses="text-white" />
                {!hideNavButtons && (
                  <View className="ml-2">
                    <INatIconButton
                      icon="compass-rose-outline"
                      onPress={( ) => {
                        setExploreView( "observations" );
                        navigation.navigate( "TabNavigator", {
                          screen: "TabStackNavigator",
                          params: {
                            screen: "Explore",
                            params: {
                              taxon,
                              worldwide: true,
                              resetStoredParams: true
                            }
                          }
                        } );
                      }}
                      accessibilityLabel={t( "See-observations-of-this-taxon-in-explore" )}
                      accessibilityHint={t( "Navigates-to-explore" )}
                      size={30}
                      color={theme.colors.onPrimary}
                      className="bg-inatGreen rounded-full"
                      mode="contained"
                      preventTransparency
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
          <View className="bg-white pt-5 h-full flex-1">
            {displayTaxonDetails( )}
          </View>
        </View>
        <MediaViewerModal
          showModal={mediaViewerVisible}
          onClose={( ) => setMediaViewerVisible( false )}
          photos={photos}
          header={renderHeader}
        />
      </ScrollViewWrapper>
      {showSelectButton && (
        <StickyToolbar containerClass="items-center z-50">
          <Button
            className="max-w-[500px] w-full"
            level="focus"
            text={t( "SELECT-THIS-TAXON" )}
            onPress={( ) => {
              updateObservationKeys( {
                taxon,
                owners_identification_from_vision: usesVision
              } );
              if ( fromObsDetails ) {
                navigation.navigate( "ObsDetails", {
                  uuid: obsUuid,
                  suggestedTaxon: taxon
                } );
              } else {
                navigation.navigate( "ObsEdit" );
              }
            }}
            icon={(
              <INatIcon
                name="checkmark"
                size={19}
                color={theme.colors.onPrimary}
              />
            )}
            iconPosition="right"
          />
        </StickyToolbar>
      )}
    </>
  );
};

export default TaxonDetails;
