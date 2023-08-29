// @flow

import { useNavigation } from "@react-navigation/native";
import { INatIconButton } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  handleClose?: Function,
  black?: boolean,
  size?: number,
  icon?: string,
  width?: number,
  height?: number
}

const CloseButton = ( {
  handleClose, black, size, icon,
  width, height
}: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <INatIconButton
      icon={icon || "close"}
      size={size}
      color={black
        ? theme.colors.tertiary
        : theme.colors.background}
      onPress={( ) => {
        if ( handleClose ) {
          handleClose( );
        } else {
          navigation.goBack( );
        }
      }}
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Navigate-to-previous-screen" )}
      disabled={false}
      width={width}
      height={height}
    />
  );
};
export default CloseButton;
