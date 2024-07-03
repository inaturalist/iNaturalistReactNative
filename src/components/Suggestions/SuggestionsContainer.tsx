import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
// import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
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

const initialSuggestions = {
  topSuggestion: null,
  otherSuggestions: [],
  topSuggestionType: "none",
  usingOfflineSuggestions: false,
  isLoading: true
};

const SuggestionsContainer = ( ): Node => {
  // clearing the cache of resized images for the score_image API
  // placing this here means we can keep the app size small
  // and only have the latest resized image stored in computerVisionSuggestions
  useClearComputerVisionDirectory( );
  const currentObservation = useStore( state => state.currentObservation );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  const photoUris = ObservationPhoto.mapObsPhotoUris( currentObservation );

  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[0] );
  const [selectedTaxon, setSelectedTaxon] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );
  const [suggestions, setSuggestions] = useState( initialSuggestions );
  // const [locationPermissionNeeded, setLocationPermissionNeeded] = useState( false );

  const evidenceHasLocation = !!( currentObservation?.latitude );
  // const showImproveWithLocationButton = !evidenceHasLocation
  //   && params?.lastScreen === "CameraWithDevice";

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

  const loadingOnlineSuggestions = fetchStatus === "fetching";

  // skip to offline suggestions if internet connection is spotty
  const tryOfflineSuggestions = timedOut || (
    // Don't try offline while online is loading
    !loadingOnlineSuggestions
    && (
      // Don't bother with offline if we have some online suggestions
      !onlineSuggestions
      || onlineSuggestions?.results?.length === 0
    )
  );

  const {
    offlineSuggestions,
    loadingOfflineSuggestions
  } = useOfflineSuggestions( selectedPhotoUri, {
    tryOfflineSuggestions
  } );

  const usingOfflineSuggestions = tryOfflineSuggestions && offlineSuggestions?.length > 0;

  useNavigateWithTaxonSelected(
    selectedTaxon,
    ( ) => setSelectedTaxon( null ),
    { vision: true }
  );

  const onPressPhoto = useCallback(
    uri => {
      if ( uri === selectedPhotoUri ) {
        setMediaViewerVisible( true );
      } else {
        setSuggestions( initialSuggestions );
        setSelectedPhotoUri( uri );
      }
    },
    [
      selectedPhotoUri
    ]
  );

  const debugData = {
    timedOut,
    onlineSuggestions,
    offlineSuggestions,
    onlineSuggestionsError,
    onlineSuggestionsUpdatedAt,
    selectedPhotoUri,
    showSuggestionsWithLocation,
    topSuggestionType: suggestions.topSuggestionType
  };

  const unfilteredSuggestions = onlineSuggestions?.results?.length > 0
    ? onlineSuggestions.results
    : offlineSuggestions;

  const humanSuggestion = _.find( unfilteredSuggestions, s => s.taxon.id === HUMAN_ID );

  const sortSuggestions = useCallback( ( ) => {
    if ( humanSuggestion ) {
      return [humanSuggestion];
    }
    if ( !usingOfflineSuggestions ) {
      // use the vision_score to display sorted suggestions when evidence
      // does not include a location; use the combined_score to display
      // sorted suggestions when evidence includes a location
      if ( showSuggestionsWithLocation ) {
        return _.orderBy( unfilteredSuggestions, "combined_score", "desc" );
      }
      return _.orderBy( unfilteredSuggestions, "vision_score", "desc" );
    }
    return unfilteredSuggestions;
  }, [
    humanSuggestion,
    showSuggestionsWithLocation,
    unfilteredSuggestions,
    usingOfflineSuggestions
  ] );

  const filterSuggestions = useCallback( ( ) => {
    const removeTopSuggestion = ( list, id ) => _.remove( list, item => item.taxon.id === id );
    const sortedSuggestions = sortSuggestions( );
    const newSuggestions = {
      topSuggestion: null,
      otherSuggestions: sortedSuggestions,
      usingOfflineSuggestions,
      isLoading: false
    };
    if ( sortedSuggestions.length === 0 ) {
      return {
        ...newSuggestions,
        otherSuggestions: [],
        topSuggestionType: "none"
      };
    }
    // return first sorted result if there's a human suggestion, if we're
    // using offline suggestions, or if there's only one suggestion
    if ( humanSuggestion || usingOfflineSuggestions || sortedSuggestions.length === 1 ) {
      const firstSuggestion = sortedSuggestions.shift( );
      return {
        ...newSuggestions,
        topSuggestion: firstSuggestion,
        topSuggestionType: "first-sorted"
      };
    }

    const suggestionAboveThreshold = _.find( sortedSuggestions, s => s.combined_score > 0.78 );
    if ( suggestionAboveThreshold ) {
      // make sure we're not returning the top suggestion in Other Suggestions
      const firstSuggestion = removeTopSuggestion(
        sortedSuggestions,
        suggestionAboveThreshold.taxon.id
      )[0];
      return {
        ...newSuggestions,
        topSuggestion: firstSuggestion,
        topSuggestionType: "above-threshold"
      };
    }
    if ( onlineSuggestions?.common_ancestor ) {
      return {
        ...newSuggestions,
        topSuggestion: onlineSuggestions?.common_ancestor,
        topSuggestionType: "common-ancestor"
      };
    }

    return {
      ...newSuggestions,
      topSuggestionType: "none"
    };
  }, [
    humanSuggestion,
    onlineSuggestions?.common_ancestor,
    sortSuggestions,
    usingOfflineSuggestions
  ] );

  const allSuggestionsFetched = suggestions.isLoading
    && (
      ( !tryOfflineSuggestions && fetchStatus === "idle" )
      || !loadingOfflineSuggestions
    );

  useEffect( ( ) => {
    if ( allSuggestionsFetched ) {
      setSuggestions( filterSuggestions( ) );
    }
  }, [allSuggestionsFetched, filterSuggestions] );

  const reloadSuggestions = useCallback( ( { showLocation } ) => {
    setSuggestions( initialSuggestions );
    refetchSuggestions( );
    setShowSuggestionsWithLocation( showLocation );
  }, [refetchSuggestions] );

  return (
    <>
      <Suggestions
        debugData={debugData}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={setSelectedTaxon}
        photoUris={photoUris}
        reloadSuggestions={reloadSuggestions}
        selectedPhotoUri={selectedPhotoUri}
        // setLocationPermissionNeeded={setLocationPermissionNeeded}
        // showImproveWithLocationButton={showImproveWithLocationButton}
        showSuggestionsWithLocation={showSuggestionsWithLocation}
        suggestions={suggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={() => setMediaViewerVisible( false )}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      {/* <LocationPermissionGate
        permissionNeeded={locationPermissionNeeded}
        withoutNavigation
        onPermissionGranted={( ) => console.log( "permission granted" )}
        onPermissionDenied={( ) => console.log( "permission denied" )}
        onPermissionBlocked={( ) => console.log( "permission blocked" )}
      /> */}
    </>
  );
};

export default SuggestionsContainer;
