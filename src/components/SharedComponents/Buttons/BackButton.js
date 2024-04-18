import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import {
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  color?: string,
  onPress?: any,
  inCustomHeader?: boolean,
  customStyles?: any,
  testID?: string
}

const REACT_NAVIGATION_BACK_BUTTON_STYLE = {
  start: Platform.OS === "ios"
    ? -15
    : 0,
  minWidth: 44,
  minHeight: 44
};

const BackButton = ( {
  color = colors.black,
  onPress,
  inCustomHeader,
  customStyles,
  testID = "BackButton"
}: Props ): Node => {
  const navigation = useNavigation();
  const tintColor = color || colors.black;
  const { t } = useTranslation( );

  if ( navigation?.canGoBack( ) ) {
    return (
      <HeaderBackButton
        accessibilityLabel={t( "Go-back" )}
        labelVisible={false}
        onPress={onPress || navigation.goBack}
        // move backbutton to same start as in react-navigation
        style={[
          !inCustomHeader && REACT_NAVIGATION_BACK_BUTTON_STYLE,
          customStyles
        ]}
        testID={testID}
        tintColor={tintColor}
      />
    );
  }

  return null;
};

export default BackButton;
