// @flow

import classnames from "classnames";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import Animated from "react-native-reanimated";

import CameraFlip from "./Buttons/CameraFlip";
import Flash from "./Buttons/Flash";
import GreenCheckmark from "./Buttons/GreenCheckmark";
import TakePhoto from "./Buttons/TakePhoto";

const isTablet = DeviceInfo.isTablet();

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

  const renderPhoneCameraOptions = () => (
    <>
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        flashClassName="absolute bottom-[18px] left-[18px]"
      />
      <Animated.View
        style={!isTablet && rotatableAnimatedStyle}
        className={classnames(
          "absolute",
          "bottom-[18px]",
          "right-[18px]"
        )}
      >
        <CameraFlip
          flipCamera={flipCamera}
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
      <Flash
        toggleFlash={toggleFlash}
        hasFlash={hasFlash}
        takePhotoOptions={takePhotoOptions}
        rotatableAnimatedStyle={rotatableAnimatedStyle}
        flashClassName="absolute bottom-[18px] left-[18px] m-[12.5px]"
      />
      <CameraFlip
        flipCamera={flipCamera}
        cameraFlipClasses="m-0 mt-[25px]"
      />
      <View className="mt-[40px] mb-[40px]">
        <TakePhoto
          disallowAddingPhotos={disallowAddingPhotos}
          takePhoto={takePhoto}
        />
      </View>
      { photosTaken && (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( checkmarkClasses, "mb-[25px]" )}
        >
          <GreenCheckmark
            navToObsEdit={navToObsEdit}
          />
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
