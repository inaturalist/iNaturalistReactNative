// @flow

import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  className?: string,
  handleClose?: Function,
  black?: boolean,
  size?: number,
  icon?: string
}

const CloseButton = ( {
  className, handleClose, black, size, icon
}: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <IconButton
      icon={icon || "close"}
      size={size}
      className={className}
      iconColor={black
        ? theme.colors.tertiary
        : theme.colors.background}
      onPress={( ) => {
        if ( handleClose ) {
          handleClose( );
        } else {
          navigation.goBack( );
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Returns-to-previous-screen" )}
      disabled={false}
    />
  );
};
export default CloseButton;
