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
      icon="close"
      className={className}
      iconColor={theme.colors.background}
      onPress={( ) => navigation.goBack( )}
      accessibilityRole="button"
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Returns-to-previous-screen" )}
      disabled={false}
    />
  );
};
export default CloseButton;
