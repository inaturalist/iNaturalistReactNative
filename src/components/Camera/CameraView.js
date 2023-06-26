// @flow
import type { Node } from "react";
import React from "react";
import { Camera } from "react-native-vision-camera";

type Props = {
  photo: boolean,
  enableZoomGesture: boolean,
  isActive: boolean,
  style: Object,
  onError: Function,
  device: Object,
  ref: Object,
  orientation?: any,
};

const CameraView = ( {
  photo,
  enableZoomGesture,
  isActive,
  style,
  onError,
  ref,
  device,
  orientation
}: Props ): Node => (
  <Camera
    photo={photo}
    enableZoomGesture={enableZoomGesture}
    isActive={isActive}
    style={style}
    onError={onError}
    ref={ref}
    device={device}
    orientation={orientation}
  />
);

export default CameraView;
