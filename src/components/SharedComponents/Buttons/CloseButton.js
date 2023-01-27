// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  className?: string
}

const CloseButton = ( { className }: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <IconButton
      icon="close-button-x"
      className={className}
      iconColor={theme.colors.background}
      onPress={( ) => navigation.goBack( )}
      accessibilityLabel={t( "Return-to-previous-screen" )}
    />
  );
};
export default CloseButton;
