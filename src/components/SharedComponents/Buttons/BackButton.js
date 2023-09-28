import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

type Props = {
    color?: string,
    onPress?: Function
  }

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
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          margin: -11
        }}
      />
    );
  }

  return null;
};

export default BackButton;
