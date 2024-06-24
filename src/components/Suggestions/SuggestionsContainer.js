// @flow

import { useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
// import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

import useClearComputerVisionDirectory from "./hooks/useClearComputerVisionDirectory";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import useOfflineSuggestions from "./hooks/useOfflineSuggestions";
import useOnlineSuggestions from "./hooks/useOnlineSuggestions";
import Suggestions from "./Suggestions";

// const logger = log.extend( "SuggestionsContainer" );

const HUMAN_ID = 43584;

const SuggestionsContainer = ( ): Node => {
  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // and only have the latest resized image stored in computerVisionSuggestions
  useClearComputerVisionDirectory( );
  const { params } = useRoute( );
  const currentObservation = useStore( state => state.currentObservation );
  const taxonId = currentObservation?.taxon?.id;
  const hasVisionSuggestion = params?.hasVisionSuggestion
    && !_.isEmpty( currentObservation?.taxon );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );

  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [isLoading, setIsLoading] = useState( true );
  const [otherSuggestions, setOtherSuggestions] = useState( [] );
  const [locationPermissionNeeded, setLocationPermissionNeeded] = useState( false );
  const [usingOfflineSuggestions, setUsingOfflineSuggestions] = useState( false );

  const evidenceHasLocation = !!( currentObservation?.latitude );
  const showImproveWithLocationButton = !evidenceHasLocation
    && params?.lastScreen === "CameraWithDevice";

  const [
    showSuggestionsWithLocation,
    setShowSuggestionsWithLocation
  ] = useState( evidenceHasLocation );

  const {
    dataUpdatedAt: onlineSuggestionsUpdatedAt,
    error: onlineSuggestionsError,
    onlineSuggestions,
    timedOut,
    refetchSuggestions,
    fetchStatus
  } = useOnlineSuggestions( selectedPhotoUri, {
    showSuggestionsWithLocation
  } );

  console.log( fetchStatus, "fetch status" );

  const loadingOnlineSuggestions = fetchStatus === "fetching";

  const hasOnlineSuggestions = !onlineSuggestions
    || onlineSuggestions?.results?.length === 0;

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = timedOut || (
    // Don't try offline while online is loading
    !loadingOnlineSuggestions
    && (
      // Don't bother with offline if we have some online suggestions
      hasOnlineSuggestions
    )
  );

  const {
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions
  } );

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true }
  );

  const onPressPhoto = useCallback(
    uri => {
      if ( uri === selectedPhotoUri ) {
        setMediaViewerVisible( true );
      }
      setSelectedPhotoUri( uri );
    },
    [selectedPhotoUri]
  );

  const debugData = {
    timedOut,
    onlineSuggestions,
    offlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri,
    showSuggestionsWithLocation
  };

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const hasSuggestions = unfilteredSuggestions.length > 0;
  const humanSuggestion = _.find( unfilteredSuggestions, s => s.taxon.id === HUMAN_ID );

  const filterSuggestions = useCallback( ( ) => {
    if ( humanSuggestion ) {
      return [];
    }
    let filteredSuggestions = unfilteredSuggestions;
    if ( hasVisionSuggestion ) {
      const hideVisionSuggestionFromOther = unfilteredSuggestions.filter(
        result => result?.taxon?.id !== taxonId
      ).map( r => r );
      filteredSuggestions = hideVisionSuggestionFromOther;
    }

    const sortedSuggestions = ( ) => {
      if ( usingOfflineSuggestions ) {
        return filteredSuggestions;
      }
      // use the vision_score to display sorted suggestions when evidence
      // does not include a location; use the combined_score to display
      // sorted suggestions when evidence includes a location
      if ( showSuggestionsWithLocation ) {
        return _.orderBy( filteredSuggestions, "combined_score", "desc" );
      }
      return _.orderBy( filteredSuggestions, "vision_score", "desc" );
    };

    return sortedSuggestions( );
  }, [
    hasVisionSuggestion,
    humanSuggestion,
    showSuggestionsWithLocation,
    taxonId,
    unfilteredSuggestions,
    usingOfflineSuggestions
  ] );

  useEffect( ( ) => {
    if ( (
      hasSuggestions || loadingOfflineSuggestions === false
    ) && fetchStatus === "idle" ) {
      setOtherSuggestions( filterSuggestions( ) );
      setIsLoading( false );
    }
  }, [loadingOfflineSuggestions, hasSuggestions, filterSuggestions, fetchStatus] );

  useEffect( ( ) => {
    const hasOfflineSuggestions = tryOfflineSuggestions && offlineSuggestions?.length > 0;
    setUsingOfflineSuggestions( hasOfflineSuggestions );
  }, [
    offlineSuggestions.length,
    tryOfflineSuggestions
  ] );

  const filterTopSuggestions = ( ) => {
    if ( isLoading ) { return null; }
    if ( humanSuggestion ) {
      return humanSuggestion;
    }
    if ( hasVisionSuggestion ) {
      return currentObservation;
    }
    if ( onlineSuggestions?.results?.length > 0 ) {
      return onlineSuggestions?.common_ancestor;
    }
    return null;
  };

  const topSuggestion = filterTopSuggestions( );

  const reloadSuggestions = useCallback( ( { showLocation } ) => {
    setIsLoading( true );
    setOtherSuggestions( [] );
    refetchSuggestions( );
    setShowSuggestionsWithLocation( showLocation );
    setUsingOfflineSuggestions( false );
  }, [refetchSuggestions] );

  console.log( isLoading, loadingOnlineSuggestions, "is loading, loading online" );

  return (
    <>
      <Suggestions
        debugData={debugData}
        loading={isLoading}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        otherSuggestions={otherSuggestions}
        photoUris={photoUris}
        reloadSuggestions={reloadSuggestions}
        selectedPhotoUri={selectedPhotoUri}
        setLocationPermissionNeeded={setLocationPermissionNeeded}
        showImproveWithLocationButton={showImproveWithLocationButton}
        showSuggestionsWithLocation={showSuggestionsWithLocation}
        topSuggestion={topSuggestion}
        usingOfflineSuggestions={usingOfflineSuggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={() => setMediaViewerVisible( false )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      <LocationPermissionGate
        permissionNeeded={locationPermissionNeeded}
        withoutNavigation
        onPermissionGranted={( ) => console.log( "permission granted" )}
        onPermissionDenied={( ) => console.log( "permission denied" )}
        onPermissionBlocked={( ) => console.log( "permission blocked" )}
      />
    </>
  );
};

export default SuggestionsContainer;
