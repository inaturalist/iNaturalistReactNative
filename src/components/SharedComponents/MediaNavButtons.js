// @flow

import classnames from "classnames";
import GreenCheckmark from "components/Camera/Buttons/GreenCheckmark";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
import Animated from "react-native-reanimated";

const isTablet = DeviceInfo.isTablet();

const BUTTON_DIM = 40;

const SIDE_BUTTON_CLASSES = [
  "w-1/3",
  "h-full",
  "bg-black"
];

const CHECKMARK_CLASSES = [
  "bg-inatGreen",
  "rounded-full",
  `h-[${BUTTON_DIM}px]`,
  `w-[${BUTTON_DIM}px]`,
  "justify-center",
  "items-center"
];

type Props = {
  captureButton: Function,
  closeHidden?: boolean,
  confirmHidden?: boolean,
  mediaCaptured?: boolean,
  onClose: Function,
  onConfirm: Function,
  rotatableAnimatedStyle?: Object,
}

const MediaNavButtons = ( {
  captureButton,
  closeHidden,
  confirmHidden,
  mediaCaptured,
  onClose,
  onConfirm,
  rotatableAnimatedStyle
}: Props ): Node => (
  <View
    className="h-32 flex-row justify-between items-center bg-black"
    testID="MediaNavButtons"
  >
    {closeHidden
      ? <View className="w-1/3" />
      : (
        <CloseButton
          handleClose={onClose}
          buttonClassName="w-1/3"
        />
      )}
    {captureButton}
    {mediaCaptured && !confirmHidden
      ? (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( CHECKMARK_CLASSES, SIDE_BUTTON_CLASSES )}
        >
          <GreenCheckmark handleCheckmarkPress={onConfirm} />
        </Animated.View>
      )
      : (
        <View className={classnames( CHECKMARK_CLASSES, SIDE_BUTTON_CLASSES )} />
      )}
  </View>
);

export default MediaNavButtons;
