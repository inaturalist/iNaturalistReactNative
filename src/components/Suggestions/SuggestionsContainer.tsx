import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import PhotoCropperModal from "components/MediaViewer/PhotoCropperModal";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import {
  useLastScreen,
  useLocationPermission,
} from "sharedHooks";
import useFeatureFlag from "sharedHooks/useFeatureFlag";
import useSuggestionsV2 from "sharedHooks/useSuggestions/useSuggestionsV2";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import fetchCoarseUserLocation from "../../sharedHelpers/fetchCoarseUserLocation";
import useNavigateWithTaxonSelected from "./hooks/useNavigateWithTaxonSelected";
import Suggestions from "./Suggestions";
import TaxonSearchButton from "./TaxonSearchButton";

const SuggestionsContainer = ( ) => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { isConnected } = useNetInfo( );
  const currentObservation = useStore( state => state.currentObservation );
  const innerPhotos = ObservationPhoto.mapInnerPhotos( currentObservation );
  // ObservationPhoto.mapObsPhotoUris returns *new* strings with every call,
  // so these values need to be stabilized
  const photoUris = useMemo(
    ( ) => ObservationPhoto.mapObsPhotoUris( currentObservation ),
    [currentObservation],
  );
  const updateObservationKeys = useStore( state => state.updateObservationKeys );
  const replacePhotoInObservation = useStore( state => state.replacePhotoInObservation );
  const photoEditingEnabled = useFeatureFlag( FeatureFlag.PhotoEditingEnabled );

  const evidenceHasLocation = !!currentObservation?.latitude;

  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoUris[0] );
  const [shouldUseEvidenceLocation, setShouldUseEvidenceLocation] = useState(
    evidenceHasLocation,
  );
  // Read once, so later GPS fixes written to the observation don't each start
  // a new request
  const [evidenceLocation, setEvidenceLocation] = useState( ( ) => ( {
    latitude: currentObservation?.latitude,
    longitude: currentObservation?.longitude,
  } ) );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const {
    hasPermissions,
    renderPermissionsGate,
    requestPermissions,
  } = useLocationPermission( );
  const lastScreen = useLastScreen( );
  const showImproveWithLocationButton = useMemo( ( ) => hasPermissions === false
    && isConnected
    && lastScreen === "Camera", [
    hasPermissions,
    isConnected,
    lastScreen,
  ] );
  const improveWithLocationButtonOnPress = useCallback( ( ) => {
    requestPermissions( );
  }, [requestPermissions] );

  // Wait until we know about location permission so we don't fetch without
  // location and then again with it
  const permissionsKnown = hasPermissions !== undefined;

  const {
    suggestions,
    isLoading: suggestionsLoading,
    onlineStatus,
    offlineStatus,
    onlineError,
    offlineError,
    onlineSuggestions,
    usingOfflineSuggestions,
    urlWillCrashOffline,
    retry,
  } = useSuggestionsV2( {
    photoUri: selectedPhotoUri,
    location: shouldUseEvidenceLocation
      ? evidenceLocation
      : null,
    enabled: permissionsKnown,
    observationUuid: currentObservation?.uuid,
  } );

  const isLoading = !permissionsKnown || suggestionsLoading;

  const navigateWithTaxonSelected = useNavigateWithTaxonSelected( { vision: true } );

  const onPressPhoto = useCallback( ( uri: string ) => {
    if ( uri === selectedPhotoUri ) {
      setMediaViewerVisible( true );
    } else {
      setSelectedPhotoUri( uri );
    }
  }, [selectedPhotoUri] );

  const toggleLocation = useCallback( ( { showLocation }: { showLocation: boolean } ) => {
    setShouldUseEvidenceLocation( showLocation );
  }, [] );

  const reloadSuggestions = useCallback( ( ) => {
    // used when offline text is tapped to try to get online suggestions
    if ( !isConnected ) { return; }
    retry( );
  }, [isConnected, retry] );

  const hideLocationToggleButton = usingOfflineSuggestions
    || isLoading
    || showImproveWithLocationButton
    || !isConnected
    || !evidenceHasLocation;

  // The selected photo's file, if it's local and not uploaded yet
  const selectedLocalFilePath = innerPhotos.find( photo => !photo.url
    && Photo.getLocalPhotoUri( photo.localFilePath ) === selectedPhotoUri )?.localFilePath;
  const hasNoSuggestions = !suggestions?.topSuggestion
    && suggestions?.otherSuggestions?.length === 0;
  // Offer cropping only when the online model found nothing to suggest
  const canCropSelectedPhoto = photoEditingEnabled
    && !!selectedLocalFilePath
    && onlineStatus === "fetched"
    && !usingOfflineSuggestions
    && hasNoSuggestions;
  const [localFilePathToCrop, setLocalFilePathToCrop] = useState<string | null>( null );
  const closeCropper = useCallback( ( ) => setLocalFilePathToCrop( null ), [] );

  // Swap the cropped copy into the observation, then select it
  const selectCroppedPhoto = useCallback( ( uri: string, newLocalFilePath: string ) => {
    replacePhotoInObservation( uri, newLocalFilePath );
    const croppedUri = Photo.getLocalPhotoUri( newLocalFilePath );
    if ( croppedUri ) setSelectedPhotoUri( croppedUri );
  }, [replacePhotoInObservation] );

  // The selected photo's URI after edits made in the media viewer. It's
  // selected when the viewer closes, so a run of edits fetches suggestions
  // once, and only if the selected photo was the one edited
  const [editedSelectedPhotoUri, setEditedSelectedPhotoUri] = useState<string | null>( null );
  const editPhotoInViewer = useCallback( ( uri: string, newLocalFilePath: string ) => {
    replacePhotoInObservation( uri, newLocalFilePath );
    if ( uri === ( editedSelectedPhotoUri || selectedPhotoUri ) ) {
      setEditedSelectedPhotoUri( Photo.getLocalPhotoUri( newLocalFilePath ) || null );
    }
  }, [editedSelectedPhotoUri, replacePhotoInObservation, selectedPhotoUri] );

  const closeMediaViewer = useCallback( ( ) => {
    setMediaViewerVisible( false );
    if ( editedSelectedPhotoUri ) {
      setEditedSelectedPhotoUri( null );
      setSelectedPhotoUri( editedSelectedPhotoUri );
    }
  }, [editedSelectedPhotoUri] );

  const headerRight = useCallback( ( ) => <TaxonSearchButton />, [] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      navigation.setOptions( { headerRight } );
    } );
    return unsubscribe;
  }, [navigation, headerRight] );

  const onPermissionGranted = useCallback( async ( ) => {
    const userLocation = await fetchCoarseUserLocation( );
    updateObservationKeys( userLocation );
    if ( userLocation ) setEvidenceLocation( userLocation );
    setShouldUseEvidenceLocation( true );
  }, [updateObservationKeys] );

  const debugData = {
    onlineStatus,
    offlineStatus,
    onlineError,
    offlineError,
    onlineSuggestions,
    selectedPhotoUri,
    shouldUseEvidenceLocation,
    topSuggestionType: suggestions.topSuggestionType,
    usingOfflineSuggestions,
    suggestions,
  };

  return (
    <>
      <Suggestions
        debugData={debugData}
        handleSkip={( ) => navigateWithTaxonSelected( undefined )}
        hideLocationToggleButton={hideLocationToggleButton}
        hideSkip={params?.hideSkip}
        improveWithLocationButtonOnPress={improveWithLocationButtonOnPress}
        isLoading={isLoading}
        shouldUseEvidenceLocation={shouldUseEvidenceLocation}
        onCropPhoto={canCropSelectedPhoto
          ? ( ) => setLocalFilePathToCrop( selectedLocalFilePath )
          : undefined}
        onPressPhoto={onPressPhoto}
        onTaxonChosen={navigateWithTaxonSelected}
        photoUris={photoUris}
        reloadSuggestions={reloadSuggestions}
        selectedPhotoUri={selectedPhotoUri}
        showImproveWithLocationButton={!!showImproveWithLocationButton}
        suggestions={suggestions}
        toggleLocation={toggleLocation}
        urlWillCrashOffline={urlWillCrashOffline}
        usingOfflineSuggestions={usingOfflineSuggestions}
      />
      <MediaViewerModal
        showModal={mediaViewerVisible}
        onClose={closeMediaViewer}
        onEditPhoto={photoEditingEnabled
          ? editPhotoInViewer
          : undefined}
        uri={selectedPhotoUri}
        photos={innerPhotos}
      />
      <PhotoCropperModal
        localFilePath={localFilePathToCrop}
        onClose={closeCropper}
        onEditPhoto={selectCroppedPhoto}
      />
      {renderPermissionsGate( { onPermissionGranted } )}
    </>
  );
};

export default SuggestionsContainer;
