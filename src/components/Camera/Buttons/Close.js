// @flow

import { useNavigation } from "@react-navigation/native";
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

const Close = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );

  return (
    <IconButton
      className={classnames( cameraOptionsClasses )}
      onPress={( ) => navigation.goBack( )}
      accessibilityRole="button"
      accessibilityLabel={t( "Close-AR-camera" )}
      accessibilityState={{ disabled: false }}
      icon="close"
      iconColor={colors.white}
      size={20}
    />
  );
};

export default Close;
