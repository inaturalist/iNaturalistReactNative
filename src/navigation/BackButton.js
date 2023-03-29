import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

const BackButton = (): Node => {
  const navigation = useNavigation();

  if ( navigation?.canGoBack() ) {
    return (
      <HeaderBackButton tintColor={colors.black} onPress={navigation.goBack} />
    );
  }

  return null;
};

export default BackButton;
