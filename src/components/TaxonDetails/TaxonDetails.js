// @flow

import { refresh, useNetInfo } from "@react-native-community/netinfo";
import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native";
import { fetchSpeciesCounts } from "api/observations";
import MatchSaveDiscardButtons from "components/Match/SaveDiscardButtons";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import {
  ActivityIndicator,
  Body1,
  BottomSheet,
  Button,
  ButtonBar,
  CarouselDots,
  INatIcon,
  INatIconButton,
  List2,
  OfflineNotice
} from "components/SharedComponents";
import {
  SafeAreaView,
  View
} from "components/styledComponents";
import _, { compact } from "lodash";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import saveObservation from "sharedHelpers/saveObservation.ts";
import { fetchTaxonAndSave } from "sharedHelpers/taxon";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useExitObservationFlow,
  useLocalObservation,
  useQuery,
  useRemoteObservation,
  useTranslation,
  useUserMe
} from "sharedHooks";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import EstablishmentMeans from "./EstablishmentMeans";
import TaxonDetailsHeader, {
  OPTIONS as TAXON_DETAILS_HEADER_RIGHT_OPTIONS,
  SEARCH as TAXON_DETAILS_HEADER_RIGHT_SEARCH
} from "./TaxonDetailsHeader";
import TaxonDetailsMediaViewerHeader from "./TaxonDetailsMediaViewerHeader";
import TaxonDetailsTitle from "./TaxonDetailsTitle";
import TaxonMapPreview from "./TaxonMapPreview";
import TaxonMedia from "./TaxonMedia";
import Taxonomy from "./Taxonomy";
import Wikipedia from "./Wikipedia";

const SCROLL_VIEW_STYLE = {
  backgroundColor: colors.white,
  flexGrow: 1
};

const logger = log.extend( "TaxonDetails" );

const { useRealm } = RealmContext;

const isTablet = DeviceInfo.isTablet();

const TaxonDetails = ( ): Node => {
  // Local state
  const [invertToWhiteBackground, setInvertToWhiteBackground] = useState( false );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [sheetVisible, setSheetVisible] = useState( false );
  const [mediaIndex, setMediaIndex] = useState( 0 );

  // Plug into global state
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const currentEditingObservation = useStore( state => state.currentObservation );
  const getCurrentObservation = useStore( state => state.getCurrentObservation );
  const setExploreView = useStore( state => state.setExploreView );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const resetMyObsOffsetToRestore = useStore( state => state.resetMyObsOffsetToRestore );

  // Hooks
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id, hideNavButtons, representativePhoto } = params;
  const { t } = useTranslation( );
  const { isConnected } = useNetInfo( );
  const { remoteUser } = useUserMe( );
  const exitObservationFlow = useExitObservationFlow( {
    skipStoreReset: true
  } );
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  // Figure out where the user navigated from
  const navState = useNavigationState( nav => nav );
  const history = navState?.routes.map( r => r.name ) || [];
  // Assume the stack was reset by the last instance of Explore, even though
  // we still support backing out beyond that
  const usableStackIndex = Math.max(
    0,
    history.lastIndexOf( "Explore" ),
    history.lastIndexOf( "RootExplore" )
  );
  const usableHistory = history.slice( usableStackIndex, history.length );
  const fromObsDetails = usableHistory.includes( "ObsDetails" );
  const fromSuggestions = usableHistory.includes( "Suggestions" );
  const fromObsEdit = usableHistory.includes( "ObsEdit" );
  const fromMatch = usableHistory.includes( "Match" );
  const usableRoutes = navState?.routes.slice( usableStackIndex, history.length ) || [];

  // previous ObsDetails observation uuid
  const obsUuid = fromObsDetails
    ? _.find( usableRoutes.slice().reverse(), r => r.name === "ObsDetails" ).params.uuid
    : null;
  const localObservation = useLocalObservation( obsUuid );
  const { remoteObservation } = useRemoteObservation(
    obsUuid,
    !localObservation && !currentEditingObservation
  );
  let mappableObservation = currentEditingObservation;
  if ( localObservation ) {
    mappableObservation = localObservation;
  } else if ( remoteObservation ) {
    mappableObservation = Observation.mapApiToRealm( remoteObservation );
  }

  const showSelectButton = fromSuggestions || fromObsEdit;

  // Determine if this taxon was automatically suggested or if the user chose
  // it themselves. If the user reached TaxonDetails from Match or
  // Suggestions, that means they got here by viewing more info about one of
  // the automatically suggested taxa. Any other situation, e.g. getting here
  // from a taxon search interface or by going up or down the taxonomic
  // hierarchy on TaxonDetails, means the user manually chose a taxon.
  const prevScreen = usableHistory[usableHistory.length - 2];
  const identFromVision = [
    "Match",
    "Suggestions"
  ].includes( prevScreen );

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

  const taxonPhotos = compact(
    taxon?.taxonPhotos
      ? taxon.taxonPhotos.map( taxonPhoto => taxonPhoto.photo )
      : [taxon?.defaultPhoto]
  );
  // Add the representative photo at the start of the list of taxon photos.
  const taxonPhotosWithRepPhoto = compact( [
    representativePhoto,
    ...taxonPhotos
  ] );
  // The representative photo might be already included in taxonPhotosNoIconic
  const photos = _.uniqBy( taxonPhotosWithRepPhoto, "id" );

  const updateTaxon = useCallback( ( ) => {
    updateObservationKeys( {
      taxon,
      owners_identification_from_vision: identFromVision
    } );
  }, [
    taxon,
    updateObservationKeys,
    identFromVision
  ] );

  // Close the sheet, save, the obs, any additional UI futzing required
  const saveObservationFromSheet = useCallback( async ( ) => {
    setSheetVisible( false );
    updateTaxon( );
    // We need the updated currentObservation immediately to pass to saveObservation
    const currentObservation = getCurrentObservation( );
    const isNewObs = !currentObservation?._created_at;
    await saveObservation( currentObservation, cameraRollUris, realm );
    // If we are saving a new observations, reset the stored my obs offset to
    // restore b/c we want MyObs rendered in its default state with this new
    // observation visible at the top
    if ( isNewObs ) {
      resetMyObsOffsetToRestore();
    }
  }, [
    cameraRollUris,
    getCurrentObservation,
    realm,
    resetMyObsOffsetToRestore,
    updateTaxon
  ] );

  const saveForLater = useCallback( async ( ) => {
    await saveObservationFromSheet( );
    exitObservationFlow( );
  }, [
    exitObservationFlow,
    saveObservationFromSheet
  ] );

  const uploadNow = useCallback( async ( ) => {
    await saveObservationFromSheet( );
    exitObservationFlow( {
      navigate: ( ) => navigation.navigate( "LoginStackNavigator" )
    } );
  }, [exitObservationFlow, navigation, saveObservationFromSheet] );

  const renderHeader = useCallback( ( { onClose } ) => (
    <TaxonDetailsMediaViewerHeader
      showSpeciesSeenCheckmark={currentUserHasSeenTaxon}
      taxon={taxon}
      onClose={onClose}
    />
  ), [taxon, currentUserHasSeenTaxon] );

  const displayTaxonDetails = ( ) => {
    if ( isLoading ) {
      return <View className="m-3 flex-1 h-full justify-center"><ActivityIndicator /></View>;
    }

    if ( error?.message?.match( /Network request failed/ ) ) {
      return (
        <View className="py-[93px]">
          <OfflineNotice
            onPress={( ) => {
              refresh();
              refetch();
            }}
          />
        </View>
      );
    }

    if ( error ) {
      return <Body1 className="mx-3">{ t( "Something-went-wrong" ) }</Body1>;
    }

    if ( !taxon ) return null;

    return (
      <View className="mx-3">
        <EstablishmentMeans taxon={taxon} />
        <Wikipedia taxon={taxon} />
        <Taxonomy taxon={taxon} hideNavButtons={hideNavButtons} />
        <TaxonMapPreview
          observation={mappableObservation}
          taxon={taxon}
          showSpeciesSeenCheckmark={currentUserHasSeenTaxon}
        />
      </View>
    );
  };

  const displayScrollDots = () => (
    <CarouselDots length={photos.length} index={mediaIndex} />
  );

  const showExploreButton = !hideNavButtons && isConnected && !fromMatch;

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
      {showExploreButton && (
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
            color={colors.white}
            className="bg-inatGreen rounded-full"
            mode="contained"
            preventTransparency
          />
        </View>
      )}
    </View>
  ), [
    currentUserHasSeenTaxon,
    showExploreButton,
    navigation,
    setExploreView,
    t,
    taxon
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

  const handleScroll = e => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const shouldInvert = !!( scrollY > 150 );
    if ( shouldInvert !== invertToWhiteBackground ) {
      setInvertToWhiteBackground( shouldInvert );
    }
  };

  // Choose what kind of header to show
  let headerRightType = TAXON_DETAILS_HEADER_RIGHT_OPTIONS;
  if ( hideNavButtons ) {
    headerRightType = undefined;
  } else if ( fromMatch ) {
    headerRightType = TAXON_DETAILS_HEADER_RIGHT_SEARCH;
  }

  return (
    <SafeAreaView
      className="flex-1 bg-black"
    >
      {/*
        Making the bar dark here seems like the right thing, but I haven't
        figured a way to do that *and* not making the bg of the scrollview
        black, which reveals a dark area at the bottom of the screen on
        overscroll in iOS ~~~kueda20240228
      */}
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <ScrollView
        testID={`TaxonDetails.${taxon?.id}`}
        onScroll={handleScroll}
        contentContainerStyle={SCROLL_VIEW_STYLE}
        scrollEventThrottle={16}
        stickyHeaderIndices={[0]}
      >
        <TaxonDetailsHeader
          invertToWhiteBackground={
            fromMatch
              ? true
              : invertToWhiteBackground
          }
          hasTitle={fromMatch}
          headerRightType={headerRightType}
          onPressSearch={
            fromMatch
              ? ( ) => navigation.navigate( "MatchTaxonSearchScreen" )
              : undefined
          }
          taxon={taxon}
        />
        <View className="flex flex-1 flex-grow bg-black -mt-[64px]">
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
      </ScrollView>
      {fromMatch && (
        <MatchSaveDiscardButtons
          handlePress={async action => {
            if ( action === "save" ) {
              await saveObservationFromSheet( );
            }
            exitObservationFlow( );
          }}
        />
      )}
      {showSelectButton && (
        <ButtonBar containerClass="items-center z-50">
          <Button
            testID="TaxonDetails.SelectButton"
            className="max-w-[500px] w-full"
            level="focus"
            text={t( "SELECT-THIS-TAXON" )}
            onPress={( ) => {
              if ( fromSuggestions && !currentUser ) {
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
                color={colors.white}
              />
            )}
            iconPosition="right"
          />
        </ButtonBar>
      )}
      <BottomSheet
        hidden={!sheetVisible}
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
                <View className="flex-row" key={string}>
                  <List2>{"\u2022 "}</List2>
                  <List2>{string}</List2>
                </View>
              ) )}
            </View>
            <List2 className="mt-3">
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
    </SafeAreaView>
  );
};

export default TaxonDetails;
