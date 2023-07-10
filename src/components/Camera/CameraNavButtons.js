// @flow

import classnames from "classnames";
import {
  CloseButton,
  INatIconButton
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import DeviceInfo from "react-native-device-info";
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

type Props = {
  takePhoto: Function,
  handleClose: Function,
  disallowAddingPhotos: boolean,
  photosTaken: boolean,
  rotatableAnimatedStyle: Object,
  navToObsEdit: Function
}

const CameraNavButtons = ( {
  takePhoto,
  handleClose,
  disallowAddingPhotos,
  photosTaken,
  rotatableAnimatedStyle,
  navToObsEdit
}: Props ): Node => {
  const { t } = useTranslation( );

  return !isTablet && (
    <View className="h-32 flex-row justify-between items-center">
      <CloseButton
        handleClose={handleClose}
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
              backgroundColor={colors.white}
            />
          </Animated.View>
        )
        : (
          <View className={classnames( checkmarkClasses, "w-1/3 h-full bg-black" )} />
        )}
    </View>
  );
};

export default CameraNavButtons;
