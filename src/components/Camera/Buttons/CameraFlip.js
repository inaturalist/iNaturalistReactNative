// @flow

import classnames from "classnames";
import type { Node } from "react";
import React from "react";
import {
  IconButton
} from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

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
  flipCamera: Function,
  cameraFlipClasses?: string
}

const CameraFlip = ( {
  flipCamera,
  cameraFlipClasses
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <IconButton
      className={classnames( cameraOptionsClasses, cameraFlipClasses )}
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
