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
  onPress, color
}: Props ): Node => {
  const navigation = useNavigation();
  const tintColor = color || colors.black;

  if ( navigation?.canGoBack ) {
    return (
      <HeaderBackButton tintColor={tintColor} onPress={onPress || navigation.goBack} />
    );
  }

  return (
    null
  );
};

export default BackButton;
