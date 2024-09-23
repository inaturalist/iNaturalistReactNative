// @flow

import { refresh, useNetInfo } from "@react-native-community/netinfo";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { fetchSpeciesCounts } from "api/observations";
import classnames from "classnames";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  ActivityIndicator,
  Body1,
  BottomSheet,
  Button,
  INatIcon,
  INatIconButton,
  List2,
  OfflineNotice,
  ScrollViewWrapper,
  StickyToolbar
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import _, { compact } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import { useTheme } from "react-native-paper";
import { log } from "sharedHelpers/logger";
import { fetchTaxonAndSave } from "sharedHelpers/taxon";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useQuery,
  useTranslation,
  useUserMe
} from "sharedHooks";
import useStore from "stores/useStore";

import EstablishmentMeans from "./EstablishmentMeans";
import TaxonDetailsHeader from "./TaxonDetailsHeader";
import TaxonDetailsMediaViewerHeader from "./TaxonDetailsMediaViewerHeader";
import TaxonDetailsTitle from "./TaxonDetailsTitle";
import TaxonMapPreview from "./TaxonMapPreview";
import TaxonMedia from "./TaxonMedia";
import Taxonomy from "./Taxonomy";
import Wikipedia from "./Wikipedia";

const logger = log.extend( "TaxonDetails" );

const { useRealm } = RealmContext;

const isTablet = DeviceInfo.isTablet();

const TaxonDetails = ( ): Node => {
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const setExploreView = useStore( state => state.setExploreView );
  const theme = useTheme( );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id, hideNavButtons } = params;
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [sheetVisible, setSheetVisible] = useState( false );
  const { remoteUser } = useUserMe( );
  const [mediaIndex, setMediaIndex] = useState( 0 );
  const navState = useNavigationState( nav => nav );
  const history = navState?.routes.map( r => r.name ) || [];
  const fromObsDetails = history.includes( "ObsDetails" );
  const fromSuggestions = history.includes( "Suggestions" );
  const fromObsEdit = history.includes( "ObsEdit" );

  // previous ObsDetails observation uuid
  const obsUuid = fromObsDetails
    ? _.find( navState?.routes?.slice().reverse(), r => r.name === "ObsDetails" ).params.uuid
    : null;

  const showSelectButton = fromSuggestions || fromObsEdit;
  const usesVision = history[history.length - 2] === "Suggestions";

  const realm = useRealm( );
  const localTaxon = realm.objectForPrimaryKey( "Taxon", id );

  const taxonFetchParams = {
    place_id: remoteUser?.place_id
  };

  // Note that we want to authenticate this to localize names, desc language, etc.
  const {
    data: remoteTaxon,
    isLoading,
    refetch,
    error
  } = useAuthenticatedQuery(
    ["fetchTaxon", id],
    optsWithAuth => fetchTaxonAndSave( id, realm, taxonFetchParams, optsWithAuth )
  );

  const taxon = remoteTaxon || localTaxon;

  const currentUser = useCurrentUser( );

  const { data: seenByCurrentUser } = useQuery(
    ["fetchSpeciesCounts", taxon?.id],
    ( ) => fetchSpeciesCounts( {
      user_id: currentUser?.id,
      taxon_id: taxon?.id,
      fields: {
        taxon: {
          id: true
        }
      }
    } ),
    {
      enabled: !!( taxon && taxon?.id !== 0 && taxon?.rank_level <= 10 && currentUser )
    }
  );

  useEffect( ( ) => {
    if ( error ) {
      logger.error( "Failed to retrieve taxon", error );
    }
  }, [error] );

  const currentUserHasSeenTaxon = seenByCurrentUser?.total_results === 1;

  const photos = compact(
    taxon?.taxonPhotos
      ? taxon.taxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );

  const updateTaxon = ( ) => {
    updateObservationKeys( {
      taxon,
      owners_identification_from_vision: usesVision
    } );
  };

  const saveForLater = ( ) => {
    setSheetVisible( false );
    updateTaxon( );
  };

  const uploadNow = ( ) => {
    setSheetVisible( false );
    updateTaxon( );
  };

  const renderHeader = useCallback( ( { onClose } ) => (
    <TaxonDetailsMediaViewerHeader
      showSpeciesSeenCheckmark={currentUserHasSeenTaxon}
      taxon={taxon}
      onClose={onClose}
    />
  ), [taxon, currentUserHasSeenTaxon] );

  const displayTaxonDetails = ( ) => {
    if ( isLoading ) {
      return <View className="m-3 flex-1 h-full"><ActivityIndicator /></View>;
    }

    if ( error?.message?.match( /Network request failed/ ) ) {
      return (
        <View className="py-[93px]">
          <OfflineNotice
            onPress={( ) => {
              refresh();
              refetch();
            }}
            color="black"
          />
        </View>
      );
    }

    if ( error ) {
      return <Body1 className="mx-3">{ t( "Something-went-wrong" ) }</Body1>;
    }

    return (
      <View className="mx-3">
        <EstablishmentMeans taxon={taxon} />
        <Wikipedia taxon={taxon} />
        <Taxonomy taxon={taxon} hideNavButtons={hideNavButtons} />
        <TaxonMapPreview taxon={taxon} showSpeciesSeenCheckmark={currentUserHasSeenTaxon} />
      </View>
    );
  };

  const displayScrollDots = () => (
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
  );

  const displayTaxonTitle = useCallback( ( ) => (
    <View
      className="w-full flex-row items-center pl-5 pr-5 pb-5"
      pointerEvents="box-none"
    >
      <TaxonDetailsTitle
        optionalClasses="text-white"
        showSpeciesSeenCheckmark={currentUserHasSeenTaxon}
        taxon={taxon}
      />
      {!hideNavButtons && isConnected && (
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
                    worldwide: true
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
  ), [
    currentUserHasSeenTaxon,
    hideNavButtons,
    isConnected,
    navigation,
    setExploreView,
    t,
    taxon,
    theme.colors.onPrimary
  ] );

  const displayTaxonMedia = () => {
    if ( isConnected === false ) {
      return (
        <OfflineNotice
          onPress={( ) => {
            refresh();
            refetch();
          }}
          color="white"
        />
      );
    }
    return (
      <TaxonMedia
        loading={isLoading}
        photos={photos}
        tablet={isTablet}
        onChangeIndex={setMediaIndex}
      />
    );
  };

  const bulletedText = [
    t( "Get-your-identification-verified-by-real-people" ),
    t( "Share-your-observation-where-it-can-help-scientists" )
  ];

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
        <TaxonDetailsHeader
          hideNavButtons={hideNavButtons}
          taxonId={taxon?.id}
        />
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View className="flex-1 h-full bg-black">
          <View className="w-full h-[420px] shrink-1">
            {displayTaxonMedia()}
            <View
              className="absolute bottom-0 p-0 w-full"
              pointerEvents="box-none"
            >
              {isConnected && !isTablet && photos.length > 1 && displayScrollDots()}
              {taxon && displayTaxonTitle()}
            </View>
          </View>
          <View className="bg-white py-5 h-full flex-1">
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
              if ( fromSuggestions ) {
                setSheetVisible( true );
              } else {
                updateTaxon( );
                if ( fromObsDetails ) {
                  const obsDetailsParam = {
                    uuid: obsUuid,
                    identTaxonId: taxon?.id,
                    identAt: Date.now()
                  };
                  navigation.navigate( "ObsDetails", obsDetailsParam );
                } else {
                  navigation.navigate( "ObsEdit" );
                }
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
      <BottomSheet
        hidden={!sheetVisible}
        handleClose={() => setSheetVisible( false )}
        onPressClose={() => setSheetVisible( false )}
        headerText={t( "UPLOAD-TO-INATURALIST" )}
      >
        <View className="p-4">
          <View className="px-3">
            <List2>
              {t( "By-uploading-your-observation-to-iNaturalist-you-can" )}
            </List2>
            <View className="mt-3">
              {bulletedText.map( string => (
                <View className="flex-row">
                  <List2>{`\u2022 `}</List2><List2>{string}</List2>
                </View>
              ) )}
            </View>
            <List2
              className="mt-3"
            >
              {t( "Just-make-sure-the-organism-is-wild" )}
            </List2>
          </View>
          <Button
            onPress={() => uploadNow()}
            text={t( "UPLOAD-NOW" )}
            className="mt-5"
            level="focus"
          />
          <Button
            onPress={() => saveForLater()}
            text={t( "SAVE-FOR-LATER" )}
            className="mt-5"
          />
        </View>
      </BottomSheet>
    </>
  );
};

export default TaxonDetails;
