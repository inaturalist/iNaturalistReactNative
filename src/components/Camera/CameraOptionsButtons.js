// @flow

import classnames from "classnames";
import {
  CloseButton,
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import {
  IconButton
} from "react-native-paper";
import Animated from "react-native-reanimated";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const isTablet = DeviceInfo.isTablet();

export const MAX_PHOTOS_ALLOWED = 20;

const CAMERA_BUTTON_DIM = 40;

const checkmarkClasses = [
  "bg-inatGreen",
  "rounded-full",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  `w-[${CAMERA_BUTTON_DIM}px]`,
  "justify-center",
  "items-center"
].join( " " );

const cameraOptionsClasses = [
  "bg-black/50",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CAMERA_BUTTON_DIM}px]`
].join( " " );

type Props = {
  takePhoto: Function,
  handleClose: Function,
  disallowAddingPhotos: boolean,
  photosTaken: boolean,
  rotatableAnimatedStyle: Object,
  navToObsEdit: Function,
  toggleFlash: Function,
  flipCamera: Function,
  hasFlash: boolean,
  takePhotoOptions: Object
}

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

const CameraOptionsButtons = ( {
  takePhoto,
  handleClose,
  disallowAddingPhotos,
  photosTaken,
  rotatableAnimatedStyle,
  navToObsEdit,
  toggleFlash,
  flipCamera,
  hasFlash,
  takePhotoOptions
}: Props ): Node => {
  // screen orientation locked to portrait on small devices
  if ( !isTablet ) {
    Orientation.lockToPortrait();
  }
  const { t } = useTranslation( );

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
          handleClose={handleClose}
          size={18}
        />
      </View>
      { !photosTaken && <CameraButtonPlaceholder /> }
    </View>
  );

  return isTablet
    ? renderTabletCameraOptions( )
    : renderPhoneCameraOptions( );
};

export default CameraOptionsButtons;
