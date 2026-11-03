import classnames from "classnames";
import RotatableIconWrapper from "components/Camera/RotatableIconWrapper";
import { Body3 } from "components/SharedComponents";
import {
  CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE,
} from "components/SharedComponents/Buttons/TransparentCircleButton";
import { Pressable } from "components/styledComponents";
import React from "react";
import type { AnimatedStyle } from "react-native-reanimated";
import { useTranslation } from "sharedHooks";

interface Props {
  rotatableAnimatedStyle: AnimatedStyle;
  handleZoomButtonPress: ( ) => void;
  zoomClassName?: string;
  zoomTextValue: string;
}

const Zoom = ( {
  rotatableAnimatedStyle,
  handleZoomButtonPress,
  zoomClassName,
  zoomTextValue,
}: Props ) => {
  const { t } = useTranslation();

  return (
    <RotatableIconWrapper
      rotatableAnimatedStyle={rotatableAnimatedStyle}
      containerClass={classnames( zoomClassName )}
    >
      <Pressable
        className={classnames( CIRCLE_OPTIONS_CLASSES, CIRCLE_SIZE, "active:opacity-80" )}
        onPress={handleZoomButtonPress}
        accessibilityRole="button"
        accessibilityLabel={t( "Change-zoom" )}
        accessibilityState={{ disabled: false }}
      >
        <Body3 className="text-s text-white">
          {t( "zoom-x", { zoom: Number( zoomTextValue ) } )}
        </Body3>
      </Pressable>
    </RotatableIconWrapper>
  );
};

export default Zoom;
