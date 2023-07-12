// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import { TaxonResult } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import {
  BackHandler,
  Platform,
  StatusBar
} from "react-native";
import DeviceInfo from "react-native-device-info";
import LinearGradient from "react-native-linear-gradient";
import Orientation from "react-native-orientation-locker";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
// Temporarily using a fork so this is to avoid that eslint error. Need to
// remove if/when we return to the main repo
import {
  Camera,
  useCameraDevices
} from "react-native-vision-camera";
import Photo from "realmModels/Photo";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";

import ARCameraButtons from "./ARCameraButtons";
import CameraView from "./CameraView";
import FadeInOutView from "./FadeInOutView";

const isTablet = DeviceInfo.isTablet();

export const MAX_PHOTOS_ALLOWED = 20;

const exampleTaxon = {
  id: 12704,
  name: "Muscicapidae",
  rank: "family",
  rank_level: 30,
  preferred_common_name: "Old World Flycatchers and Chats"
};

const ARCamera = ( ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }
  const {
    cameraPreviewUris,
    setCameraPreviewUris,
    evidenceToAdd,
    setEvidenceToAdd,
    setOriginalCameraUrisMap,
    originalCameraUrisMap
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const addEvidence = params?.addEvidence;
  // $FlowFixMe
  const camera = useRef<Camera>( null );
  const [cameraPosition, setCameraPosition] = useState( "back" );
  const devices = useCameraDevices( );
  const device = devices[cameraPosition];
  const hasFlash = device?.hasFlash;
  const initialPhotoOptions = hasFlash
    ? { flash: "off" }
    : { };
  const [takePhotoOptions, setTakePhotoOptions] = useState( initialPhotoOptions );
  const [savingPhoto, setSavingPhoto] = useState( false );
  const { deviceOrientation } = useDeviceOrientation( );

  const isLandscapeMode = [LANDSCAPE_LEFT, LANDSCAPE_RIGHT].includes( deviceOrientation );

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
    navigation.goBack( );
  }, [navigation] );

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

  const takePhoto = async ( ) => {
    const cameraPhoto = await camera.current.takePhoto( takePhotoOptions );
    let photoRotation = 0;
    switch ( cameraPhoto.metadata.Orientation ) {
      case 1:
        // Because the universe is a cruel, cruel place
        if ( Platform.OS === "android" ) {
          photoRotation = 180;
        }
        break;
      case 6:
        photoRotation = 90;
        break;
      case 8:
        photoRotation = 270;
        break;
      default:
        photoRotation = 0;
    }
    const newPhoto = await Photo.new( cameraPhoto.path, { rotation: photoRotation } );
    const uri = newPhoto.localFilePath;

    // Remember original (unresized) camera URI
    setOriginalCameraUrisMap( { ...originalCameraUrisMap, [uri]: cameraPhoto.path } );

    setCameraPreviewUris( cameraPreviewUris.concat( [uri] ) );
    if ( addEvidence ) {
      setEvidenceToAdd( [...evidenceToAdd, uri] );
    }
    setSavingPhoto( false );
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

  // const navToObsEdit = ( ) => {
  //   if ( addEvidence ) {
  //     addCameraPhotosToCurrentObservation( evidenceToAdd );
  //     navigation.navigate( "ObsEdit" );
  //     return;
  //   }
  //   createObsWithCameraPhotos( cameraPreviewUris );
  //   navigation.navigate( "ObsEdit" );
  // };

  const flexDirection = isTablet && !isLandscapeMode
    ? "flex-row"
    : "flex-col";

  return (
    <View className={`flex-1 ${flexDirection}`}>
      <StatusBar hidden />
      {device && (
        <CameraView
          device={device}
          camera={camera}
          orientation={
          // In Android the camera won't set the orientation metadata
          // correctly without this, but in iOS it won't display the
          // preview correctly *with* it
            Platform.OS === "android"
              ? deviceOrientation
              : null
          }
        />
      )}
      <LinearGradient
        colors={["#000000", "rgba(0, 0, 0, 0)"]}
        locations={[0.001, 1]}
        className="w-full"
      >
        <View className={
          classnames( "self-center h-[219px]", {
            "w-[493px]": isTablet,
            "pt-8 w-[346px]": !isTablet
          } )
        }
        >
          <TaxonResult
            taxon={exampleTaxon}
            handleCheckmarkPress={( ) => { }}
            testID={`ARCamera.taxa.${exampleTaxon.id}`}
            clearBackground
            confidence={4}
          />
        </View>
      </LinearGradient>
      <FadeInOutView savingPhoto={savingPhoto} />
      <ARCameraButtons
        takePhoto={takePhoto}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        toggleFlash={toggleFlash}
        flipCamera={flipCamera}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        isLandscapeMode={isLandscapeMode}
      />
    </View>
  );
};

export default ARCamera;
