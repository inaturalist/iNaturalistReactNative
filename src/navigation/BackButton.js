import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

const BackButton = (): Node => {
  const navigation = useNavigation();
  console.log(navigation);
  return (
    <HeaderBackButton tintColor={colors.black} onPress={navigation.goBack} />
  );
};

export default BackButton;
