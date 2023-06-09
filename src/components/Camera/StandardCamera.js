// @flow

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import classnames from "classnames";
import {
  CloseButton,
  INatIcon,
  INatIconButton
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
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
import Orientation from "react-native-orientation-locker";
import {
  IconButton,
  Snackbar
} from "react-native-paper";
import Animated, {
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
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

import CameraView from "./CameraView";
import DiscardChangesSheet from "./DiscardChangesSheet";
import FadeInOutView from "./FadeInOutView";
import PhotoPreview from "./PhotoPreview";

const isTablet = DeviceInfo.isTablet();

export const MAX_PHOTOS_ALLOWED = 20;

const CAMERA_BUTTON_DIM = 40;

// Empty space where a camera button should be so buttons don't jump around
// when they appear or disappear
const CameraButtonPlaceholder = ( ) => (
  <View
    accessibilityElementsHidden
    aria-hidden
    className={classnames(
      `w-[${CAMERA_BUTTON_DIM}px]`,
      `h-[${CAMERA_BUTTON_DIM}px]`
    )}
  />
);

const StandardCamera = ( ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }
  const {
    addCameraPhotosToCurrentObservation,
    createObsWithCameraPhotos,
    cameraPreviewUris,
    setCameraPreviewUris,
    allObsPhotoUris,
    evidenceToAdd,
    setEvidenceToAdd,
    setOriginalCameraUrisMap,
    originalCameraUrisMap
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
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
  const disallowAddingPhotos = allObsPhotoUris.length >= MAX_PHOTOS_ALLOWED;
  const [showAlert, setShowAlert] = useState( false );
  const { deviceOrientation } = useDeviceOrientation( );
  const [showDiscardSheet, setShowDiscardSheet] = useState( false );
  const { screenWidth } = useDeviceOrientation( );

  const photosTaken = allObsPhotoUris.length > 0;
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

  const cameraOptionsClasses = [
    "bg-black/50",
    `h-[${CAMERA_BUTTON_DIM}px]`,
    "items-center",
    "justify-center",
    "rounded-full",
    `w-[${CAMERA_BUTTON_DIM}px]`
  ].join( " " );

  const checkmarkClasses = [
    "bg-inatGreen",
    "rounded-full",
    `h-[${CAMERA_BUTTON_DIM}px]`,
    `w-[${CAMERA_BUTTON_DIM}px]`,
    "justify-center",
    "items-center"
  ].join( " " );

  const handleBackButtonPress = useCallback( ( ) => {
    if ( cameraPreviewUris.length === 0 ) { return; }

    setShowDiscardSheet( true );
  }, [setShowDiscardSheet, cameraPreviewUris] );

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
    setSavingPhoto( true );
    if ( disallowAddingPhotos ) {
      setShowAlert( true );
      setSavingPhoto( false );
      return;
    }
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

  const navToObsEdit = ( ) => {
    if ( addEvidence ) {
      addCameraPhotosToCurrentObservation( evidenceToAdd );
      navigation.navigate( "ObsEdit" );
      return;
    }
    createObsWithCameraPhotos( cameraPreviewUris );
    navigation.navigate( "ObsEdit" );
  };

  const renderFlashButton = () => {
    if ( !hasFlash ) return <CameraButtonPlaceholder />;
    let testID = "";
    let accessibilityLabel = "";
    let name = "";
    const flashClassName = isTablet
      ? "m-[12.5px]"
      : "absolute bottom-[18px] left-[18px]";
    switch ( takePhotoOptions.flash ) {
      case "on":
        name = "flash-on";
        testID = "flash-button-label-flash";
        accessibilityLabel = t( "Flash-button-label-flash" );
        break;
      default: // default to off if no flash
        name = "flash-off";
        testID = "flash-button-label-flash-off";
        accessibilityLabel = t( "Flash-button-label-flash-off" );
    }

    return (
      <Animated.View
        style={!isTablet && rotatableAnimatedStyle}
        className={classnames(
          flashClassName,
          "m-0",
          "border-0"
        )}
      >
        <IconButton
          className={classnames( cameraOptionsClasses )}
          onPress={toggleFlash}
          accessibilityRole="button"
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: false }}
          icon={name}
          iconColor={colors.white}
          size={20}
        />
      </Animated.View>
    );
  };

  const renderPhoneCameraOptions = () => (
    <>
      { renderFlashButton( ) }
      <Animated.View
        style={!isTablet && rotatableAnimatedStyle}
        className={classnames(
          "absolute",
          "bottom-[18px]",
          "right-[18px]"
        )}
      >
        <IconButton
          className={classnames( cameraOptionsClasses )}
          onPress={flipCamera}
          accessibilityRole="button"
          accessibilityLabel={t( "Camera-button-label-switch-camera" )}
          accessibilityState={{ disabled: false }}
          icon="rotate"
          iconColor={colors.white}
          size={20}
        />
      </Animated.View>
    </>
  );

  const tabletCameraOptionsClasses = [
    "absolute",
    "h-[380px]",
    "items-center",
    "justify-center",
    "mr-5",
    "mt-[-190px]",
    "pb-0",
    "right-0",
    "top-[50%]"
  ];

  const renderTabletCameraOptions = ( ) => (
    <View className={classnames( tabletCameraOptionsClasses )}>
      { renderFlashButton( ) }
      <IconButton
        className={classnames( cameraOptionsClasses, "m-0", "mt-[25px]" )}
        onPress={flipCamera}
        accessibilityRole="button"
        accessibilityLabel={t( "Camera-button-label-switch-camera" )}
        accessibilityState={{ disabled: false }}
        icon="rotate"
        iconColor={colors.white}
        size={20}
      />
      <Pressable
        className={classnames(
          "bg-white",
          "rounded-full",
          "h-[60px]",
          "w-[60px]",
          "justify-center",
          "items-center",
          // There is something weird about how this gets used because
          // sometimes there just is no margin
          "mt-[40px]",
          "mb-[40px]"
        )}
        onPress={takePhoto}
        accessibilityLabel={t( "Take-photo" )}
        accessibilityRole="button"
        accessibilityState={{ disabled: disallowAddingPhotos }}
        disabled={disallowAddingPhotos}
      >
        <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
      </Pressable>
      { photosTaken && (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( checkmarkClasses, "mb-[25px]" )}
        >
          <Pressable
            onPress={navToObsEdit}
            accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
            disabled={false}
          >
            <INatIcon
              name="checkmark"
              color={colors.white}
              size={20}
              testID="camera-button-label-switch-camera"
            />
          </Pressable>
        </Animated.View>
      ) }
      <View
        className={classnames(
          cameraOptionsClasses,
          { "mb-[25px]": !photosTaken }
        )}
      >
        <CloseButton
          handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress}
          size={18}
        />
      </View>
      { !photosTaken && <CameraButtonPlaceholder /> }
    </View>
  );

  const flexDirection = isTablet && !isLandscapeMode
    ? "flex-row"
    : "flex-col";

  return (
    <View className={`flex-1 bg-black ${flexDirection}`}>
      <StatusBar hidden />
      <PhotoPreview
        // deviceOrientation={deviceOrientation}
        rotation={rotation}
        savingPhoto={savingPhoto}
        isLandscapeMode={isLandscapeMode}
        isLargeScreen={screenWidth > BREAKPOINTS.md}
        isTablet={isTablet}
      />
      <View className="relative flex-1">
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
        <FadeInOutView savingPhoto={savingPhoto} />
        {isTablet
          ? renderTabletCameraOptions()
          : renderPhoneCameraOptions()}
      </View>
      { !isTablet && (
        <View className="h-32 flex-row justify-between items-center">
          <CloseButton
            handleClose={cameraPreviewUris.length > 0 && handleBackButtonPress}
            width="33%"
            height="100%"
          />
          <Pressable
            className="w-1/3 h-full items-center justify-center"
            onPress={takePhoto}
            accessibilityLabel={t( "Take-photo" )}
            accessibilityRole="button"
            accessibilityState={{ disabled: disallowAddingPhotos }}
          >
            <View className="bg-white rounded-full h-[60px] w-[60px] justify-center items-center">
              <View className="border-[1.64px] rounded-full h-[49.2px] w-[49.2px]" />
            </View>
          </Pressable>
          {photosTaken
            ? (
              <Animated.View
                style={!isTablet && rotatableAnimatedStyle}
                className={classnames( checkmarkClasses, {
                  "w-1/3 h-full bg-black": !isTablet
                } )}
              >
                <INatIconButton
                  onPress={navToObsEdit}
                  accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: false }}
                  disabled={false}
                  icon="checkmark-circle"
                  color={colors.inatGreen}
                  size={40}
                  testID="camera-button-label-switch-camera"
                  width="100%"
                  height="100%"
                  whiteBackground
                />
              </Animated.View>
            )
            : (
              <View className={classnames( checkmarkClasses, "w-1/3 h-full bg-black" )} />
            )}
        </View>
      )}
      <Snackbar visible={showAlert} onDismiss={() => setShowAlert( false )}>
        {t( "You-can-only-upload-20-media" )}
      </Snackbar>
      {showDiscardSheet && (
        <DiscardChangesSheet
          setShowDiscardSheet={setShowDiscardSheet}
        />
      )}
    </View>
  );
};

export default StandardCamera;
