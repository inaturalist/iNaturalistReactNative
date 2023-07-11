// @flow

import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import {
  IconButton
} from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const isTablet = DeviceInfo.isTablet();

const CAMERA_BUTTON_DIM = 40;

const cameraOptionsClasses = [
  "bg-black/50",
  `h-[${CAMERA_BUTTON_DIM}px]`,
  "items-center",
  "justify-center",
  "rounded-full",
  `w-[${CAMERA_BUTTON_DIM}px]`
].join( " " );

type Props = {
  flipCamera: Function
}

const CameraFlip = ( {
  flipCamera
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <IconButton
      className={classnames( cameraOptionsClasses, {
        "m-0 mt-[25px]": isTablet
      } )}
      onPress={flipCamera}
      accessibilityRole="button"
      accessibilityLabel={t( "Camera-button-label-switch-camera" )}
      accessibilityState={{ disabled: false }}
      icon="rotate"
      iconColor={colors.white}
      size={20}
    />
  );
};

export default CameraFlip;
