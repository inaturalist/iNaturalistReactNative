import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import colors from "styles/tailwindColors";

type Props = {
  color?: string,
  onPress?: Function
}

const BACK_BUTTON_STYLE = {
  marginStart: Platform.OS === "ios"
    ? -15
    : 0
};

const BackButton = ( {
  color,
  onPress
}: Props ): Node => {
  const navigation = useNavigation();
  const tintColor = color || colors.black;

  if ( navigation?.canGoBack( ) ) {
    return (
      <HeaderBackButton
        tintColor={tintColor}
        onPress={onPress || navigation.goBack}
        // move backbutton to same margin as in react-navigation
        style={BACK_BUTTON_STYLE}
      />
    );
  }

  return null;
};

export default BackButton;
