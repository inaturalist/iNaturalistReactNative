// @flow

import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import PermissionGateContainer, { WRITE_MEDIA_PERMISSIONS }
  from "components/SharedComponents/PermissionGateContainer";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useMemo,
  useRef,
  useState
} from "react";
import {
  BackHandler,
  Platform,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
// Temporarily using a fork so this is to avoid that eslint error. Need to
// remove if/when we return to the main repo
import {
  Camera
  // react-native-vision-camera v3
  // useCameraDevice
  // react-native-vision-camera v2
} from "react-native-vision-camera";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import Photo from "realmModels/Photo";
import {
  rotatePhotoPatch,
  rotationLocalPhotoPatch,
  rotationTempPhotoPatch
} from "sharedHelpers/visionCameraPatches";
import { useTranslation } from "sharedHooks";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";
import useStore from "stores/useStore";

import { log } from "../../../react-native-logs.config";
import ARCamera from "./ARCamera/ARCamera";
import StandardCamera from "./StandardCamera/StandardCamera";

const isTablet = DeviceInfo.isTablet( );

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34
// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;
// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;

const logger = log.extend( "CameraContainer" );

type Props = {
  addEvidence: ?boolean,
  cameraType: string,
  cameraPosition: string,
  device: Object,
  setCameraPosition: Function,
  backToObsEdit: ?boolean
}

const CameraWithDevice = ( {
  addEvidence,
  cameraType,
  cameraPosition,
  device,
  setCameraPosition,
  backToObsEdit
}: Props ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait( );
  }
  const navigation = useNavigation();
  const { t } = useTranslation( );
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = {
    enableShutterSound: true,
    enableAutoStabilization: true,
    qualityPrioritization: "quality",
    ...( hasFlash && { flash: "off" } )
  };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const { deviceOrientation } = useDeviceOrientation( );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const [takingPhoto, setTakingPhoto] = useState( false );
  const [photoSaved, setPhotoSaved] = useState( false );
  const [result, setResult] = useState( null );
  const [modelLoaded, setModelLoaded] = useState( false );
  const setObservations = useStore( state => state.setObservations );
  const updateObservations = useStore( state => state.updateObservations );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const cameraPreviewUris = useStore( state => state.cameraPreviewUris );
  const galleryUris = useStore( state => state.galleryUris );
  const currentObservation = useStore( state => state.currentObservation );
  const setCameraState = useStore( state => state.setCameraState );
  const setCameraRollUris = useStore( state => state.setCameraRollUris );
  const originalCameraUrisMap = useStore( state => state.originalCameraUrisMap );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const observations = useStore( state => state.observations );
  const [permissionGranted, setPermissionGranted] = useState( false );
  const [showGalleryPermission, setShowGalleryPermission] = useState( false );

  const totalObsPhotoUris = useMemo(
    ( ) => [...cameraPreviewUris, ...galleryUris].length,
    [cameraPreviewUris, galleryUris]
  );

  const numOfObsPhotos = currentObservation?.observationPhotos?.length || 0;

  const zoom = useSharedValue( !device.isMultiCam
    ? device.minZoom
    : device.neutralZoom );
  const startZoom = useSharedValue( !device.isMultiCam
    ? device.minZoom
    : device.neutralZoom );
  const [zoomTextValue, setZoomTextValue] = useState( "1" );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

  const { minZoom } = device;
  const maxZoom = Math.min( device.maxZoom ?? 1, MAX_ZOOM_FACTOR );

  const changeZoom = ( ) => {
    const currentZoomValue = zoomTextValue;
    if ( currentZoomValue === "1" ) {
      zoom.value = withSpring( maxZoom );
      setZoomTextValue( "3" );
    } else if ( currentZoomValue === "3" ) {
      zoom.value = withSpring( minZoom );
      setZoomTextValue( ".5" );
    } else {
      zoom.value = withSpring( device.neutralZoom );
      setZoomTextValue( "1" );
    }
  };

  const onZoomStart = () => {
    startZoom.value = zoom.value;
  };

  const onZoomChange = scale => {
    // Calculate new zoom value (since scale factor is relative to initial pinch)
    const newScale = interpolate(
      scale,
      [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
      [-1, 0, 1],
      Extrapolate.CLAMP
    );
    const newZoom = interpolate(
      newScale,
      [-1, 0, 1],
      [minZoom, startZoom.value, maxZoom],
      Extrapolate.CLAMP
    );
    zoom.value = newZoom;
  };

  const animatedProps = useAnimatedProps(
    () => ( { zoom: zoom.value } ),
    [zoom]
  );

  const rotation = useSharedValue( 0 );
  switch ( deviceOrientation ) {
    case LANDSCAPE_LEFT:
      rotation.value = -90;
      break;
    case LANDSCAPE_RIGHT:
      rotation.value = 90;
      break;
    case PORTRAIT_UPSIDE_DOWN:
      rotation.value = 180;
      break;
    default:
      rotation.value = 0;
  }
  const rotatableAnimatedStyle = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: withTiming( `${-1 * ( rotation?.value || 0 )}deg` )
        }
      ]
    } ),
    [rotation.value]
  );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length > 0 ) {
      setShowDiscardSheet( true );
    } else if ( backToObsEdit ) {
      navigation.navigate( "ObsEdit" );
    } else {
      navigation.goBack( );
    }
  }, [backToObsEdit, setShowDiscardSheet, cameraPreviewUris, navigation] );

  useFocusEffect(
    // note: cannot use navigation.addListener to trigger bottom sheet in tab navigator
    // since the screen is unfocused, not removed from navigation
    useCallback( ( ) => {
      // make sure an Android user cannot back out and accidentally discard photos
      const onBackPress = ( ) => {
        handleBackButtonPress( );
        return true;
      };

      BackHandler.addEventListener( "hardwareBackPress", onBackPress );

      return ( ) => BackHandler.removeEventListener( "hardwareBackPress", onBackPress );
    }, [handleBackButtonPress] )
  );

  // Save URIs to camera gallery (if a photo was taken using the app,
  // we want it accessible in the camera's folder, as if the user has taken those photos
  // via their own camera app).
  const savePhotosToCameraGallery = useCallback( async uris => {
    if ( !permissionGranted ) { return false; }
    const savedUris = await Promise.all( uris.map( async uri => {
      // Find original camera URI of each scaled-down photo
      const cameraUri = originalCameraUrisMap[uri];

      if ( !cameraUri ) {
        console.error( `Couldn't find original camera URI for: ${uri}` );
      }
      logger.info( "savePhotosToCameraGallery, saving cameraUri: ", cameraUri );
      return CameraRoll.save( cameraUri, { type: "photo", album: "Camera" } );
    } ) );

    logger.info( "savePhotosToCameraGallery, savedUris: ", savedUris );
    // Save these camera roll URIs, so later on observation editor can update
    // the EXIF metadata of these photos, once we retrieve a location.
    setCameraRollUris( savedUris );
    return true;
  }, [originalCameraUrisMap, setCameraRollUris, permissionGranted] );

  const createObsWithCameraPhotos = useCallback( async ( localFilePaths, localTaxon ) => {
    const newObservation = await Observation.new( );
    newObservation.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( localFilePaths, {
        position: 0,
        local: true
      } );

    if ( localTaxon ) {
      newObservation.taxon = localTaxon;
      newObservation.owners_identification_from_vision = true;
    }
    setObservations( [newObservation] );
    logger.info(
      "createObsWithCameraPhotos, calling savePhotosToCameraGallery with paths: ",
      localFilePaths
    );

    return savePhotosToCameraGallery( localFilePaths );
  }, [savePhotosToCameraGallery, setObservations] );

  const createEvidenceForObsEdit = useCallback( async localTaxon => {
    if ( addEvidence ) {
      const obsPhotos = await ObservationPhoto
        .createObsPhotosWithPosition( evidenceToAdd, {
          position: numOfObsPhotos,
          local: true
        } );
      const updatedCurrentObservation = Observation
        .appendObsPhotos( obsPhotos, currentObservation );
      observations[currentObservationIndex] = updatedCurrentObservation;
      updateObservations( observations );
      logger.info(
        "addCameraPhotosToCurrentObservation, calling savePhotosToCameraGallery with paths: ",
        evidenceToAdd
      );
      return savePhotosToCameraGallery( evidenceToAdd );
    }
    return createObsWithCameraPhotos( cameraPreviewUris, localTaxon );
  }, [
    createObsWithCameraPhotos,
    cameraPreviewUris,
    addEvidence,
    evidenceToAdd,
    numOfObsPhotos,
    currentObservation,
    savePhotosToCameraGallery,
    updateObservations,
    observations,
    currentObservationIndex
  ] );

  const navToObsEdit = useCallback( async localTaxon => {
    const evidenceCreated = await createEvidenceForObsEdit( localTaxon );
    setPhotoSaved( false );

    if ( evidenceCreated ) {
      navigation.navigate( "ObsEdit" );
    } else {
      setShowGalleryPermission( true );
    }
  }, [
    createEvidenceForObsEdit,
    navigation
  ] );

  const takePhoto = async ( ) => {
    setTakingPhoto( true );
    const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );

    // Rotate the original photo depending on device orientation
    const photoRotation = rotationTempPhotoPatch( cameraPhoto, deviceOrientation );
    await rotatePhotoPatch( cameraPhoto, photoRotation );

    // Get the rotation for the local photo
    const rotationLocalPhoto = rotationLocalPhotoPatch( );

    // Create a local copy photo of the original
    const newPhoto = await Photo.new( cameraPhoto.path, {
      rotation: rotationLocalPhoto
    } );
    const uri = newPhoto.localFilePath;

    if ( addEvidence ) {
      setCameraState( {
        cameraPreviewUris: cameraPreviewUris.concat( [uri] ),
        evidenceToAdd: [...evidenceToAdd, uri],
        // Remember original (unresized) camera URI
        originalCameraUrisMap: { ...originalCameraUrisMap, [uri]: cameraPhoto.path }
      } );
    } else {
      setCameraState( {
        cameraPreviewUris: cameraPreviewUris.concat( [uri] ),
        // Remember original (unresized) camera URI
        originalCameraUrisMap: { ...originalCameraUrisMap, [uri]: cameraPhoto.path }
      } );
    }
    setTakingPhoto( false );
    setPhotoSaved( true );
  };

  const handleTaxaDetected = cvResults => {
    if ( cvResults && !modelLoaded ) {
      setModelLoaded( true );
    }
    /*
      Using FrameProcessorCamera results in this as cvResults atm on Android
      [
        {
          "stateofmatter": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "order": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        },
        {
          "species": [
            {"ancestor_ids": [Array], "name": xx, "rank": xx, "score": xx, "taxon_id": xx}
          ]
        }
      ]
    */
    /*
      Using FrameProcessorCamera results in this as cvResults atm on iOS (= top prediction)
      [
        {"name": "Aves", "rank": 50, "score": 0.7627944946289062, "taxon_id": 3}
      ]
    */
    // console.log( "cvResults :>> ", cvResults );
    const standardizePrediction = finestPrediction => ( {
      taxon: {
        rank_level: finestPrediction.rank,
        id: Number( finestPrediction.taxon_id ),
        name: finestPrediction.name
      },
      score: finestPrediction.score
    } );
    let prediction = null;
    let predictions = [];
    if ( Platform.OS === "ios" ) {
      if ( cvResults.length > 0 ) {
        const finestPrediction = cvResults[cvResults.length - 1];
        prediction = standardizePrediction( finestPrediction );
      }
    } else {
      predictions = cvResults
        ?.map( r => {
          const rank = Object.keys( r )[0];
          return r[rank][0];
        } )
        .sort( ( a, b ) => a.rank - b.rank );
      if ( predictions.length > 0 ) {
        const finestPrediction = predictions[0];
        prediction = standardizePrediction( finestPrediction );
      }
    }
    setResult( prediction );
  };

  const toggleFlash = ( ) => {
    setTakePhotoOptions( {
      ...takePhotoOptions,
      flash: takePhotoOptions.flash === "on"
        ? "off"
        : "on"
    } );
  };

  const flipCamera = ( ) => {
    const newPosition = cameraPosition === "back"
      ? "front"
      : "back";
    setCameraPosition( newPosition );
  };

  const flexDirection = isTablet && isLandscapeMode
    ? "flex-row"
    : "flex-col";

  const onPermissionGranted = ( ) => {
    setPermissionGranted( true );
    navigation.navigate( "ObsEdit" );
  };

  const onPermissionDenied = ( ) => {
    setPermissionGranted( false );
    navigation.navigate( "ObsEdit" );
  };

  const onPermissionBlocked = ( ) => {
    setPermissionGranted( false );
    navigation.navigate( "ObsEdit" );
  };

  return (
    <View className={`flex-1 bg-black ${flexDirection}`}>
      <StatusBar hidden />
      {showGalleryPermission && (
        <PermissionGateContainer
          permissions={WRITE_MEDIA_PERMISSIONS}
          title={t( "Save-photos-to-your-gallery" )}
          titleDenied={t( "Please-Allow-Gallery-Access" )}
          body={t( "Save-photos-to-your-gallery-to-create-observations" )}
          blockedPrompt={t( "Youve-previously-denied-add-photo-permissions" )}
          buttonText={t( "ADD-PHOTOS" )}
          icon="gallery"
          image={require( "images/viviana-rishe-j2330n6bg3I-unsplash.jpg" )}
          onPermissionGranted={onPermissionGranted}
          onPermissionDenied={onPermissionDenied}
          onPermissionBlocked={onPermissionBlocked}
          withoutNavigation
        />
      )}
      {cameraType === "Standard"
        ? (
          <StandardCamera
            navToObsEdit={navToObsEdit}
            flipCamera={flipCamera}
            toggleFlash={toggleFlash}
            takePhoto={takePhoto}
            handleBackButtonPress={handleBackButtonPress}
            rotatableAnimatedStyle={rotatableAnimatedStyle}
            rotation={rotation}
            isLandscapeMode={isLandscapeMode}
            device={device}
            camera={camera}
            hasFlash={hasFlash}
            takePhotoOptions={takePhotoOptions}
            setShowDiscardSheet={setShowDiscardSheet}
            showDiscardSheet={showDiscardSheet}
            takingPhoto={takingPhoto}
            changeZoom={changeZoom}
            animatedProps={animatedProps}
            zoomTextValue={zoomTextValue}
            showZoomButton={device.isMultiCam}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
            totalObsPhotoUris={totalObsPhotoUris}
            cameraPreviewUris={cameraPreviewUris}
          />
        )
        : (
          <ARCamera
            flipCamera={flipCamera}
            toggleFlash={toggleFlash}
            takePhoto={takePhoto}
            rotatableAnimatedStyle={rotatableAnimatedStyle}
            device={device}
            camera={camera}
            hasFlash={hasFlash}
            takePhotoOptions={takePhotoOptions}
            takingPhoto={takingPhoto}
            changeZoom={changeZoom}
            animatedProps={animatedProps}
            zoomTextValue={zoomTextValue}
            showZoomButton={device.isMultiCam}
            navToObsEdit={navToObsEdit}
            photoSaved={photoSaved}
            onZoomStart={onZoomStart}
            onZoomChange={onZoomChange}
            result={result}
            handleTaxaDetected={handleTaxaDetected}
            modelLoaded={modelLoaded}
            isLandscapeMode={isLandscapeMode}
          />
        )}
    </View>
  );
};

export default CameraWithDevice;
