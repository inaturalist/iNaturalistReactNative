import classnames from "classnames";
import GreenCheckmark from "components/Camera/Buttons/GreenCheckmark";
import { CloseButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import DeviceInfo from "react-native-device-info";
import type { AnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";

const isTablet = DeviceInfo.isTablet();

const BUTTON_DIM = 40;

const SIDE_BUTTON_CLASSES = [
  "w-1/3",
  "h-full",
  "bg-black",
];

const CHECKMARK_CLASSES = [
  "bg-inatGreen",
  "rounded-full",
  `h-[${BUTTON_DIM}px]`,
  `w-[${BUTTON_DIM}px]`,
  "justify-center",
  "items-center",
];

const CLOSE_CLASSES = [
  "bg-mediumGrayGhost",
  "rounded-full",
  `h-[${BUTTON_DIM}px]`,
  `w-[${BUTTON_DIM}px]`,
  "justify-center",
  "items-center",
];

interface Props {
  captureButton: React.JSX.Element;
  closeHidden?: boolean;
  confirmHidden?: boolean;
  disabled?: boolean;
  mediaCaptured?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rotatableAnimatedStyle?: AnimatedStyle;
}

const MediaNavButtons = ( {
  captureButton,
  closeHidden,
  confirmHidden,
  disabled,
  mediaCaptured,
  onClose,
  onConfirm,
  rotatableAnimatedStyle,
}: Props ) => (
  <View
    className="h-32 flex-row justify-between items-center bg-black"
    testID="MediaNavButtons"
  >
    {closeHidden
      ? <View className="w-1/3" />
      : (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( CLOSE_CLASSES, SIDE_BUTTON_CLASSES )}
        >
          <CloseButton
            handleClose={onClose}
            buttonClassName={classnames( CLOSE_CLASSES, "bg-[#232323]" )}
          />
        </Animated.View>
      )}
    {captureButton}
    {mediaCaptured && !confirmHidden
      ? (
        <Animated.View
          style={!isTablet && rotatableAnimatedStyle}
          className={classnames( CHECKMARK_CLASSES, SIDE_BUTTON_CLASSES )}
        >
          <GreenCheckmark
            disabled={disabled}
            handleCheckmarkPress={onConfirm}
          />
        </Animated.View>
      )
      : (
        <View className={classnames( CHECKMARK_CLASSES, SIDE_BUTTON_CLASSES )} />
      )}
  </View>
);

export default MediaNavButtons;
