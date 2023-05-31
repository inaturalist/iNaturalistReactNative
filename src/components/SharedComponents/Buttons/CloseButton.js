// @flow

import { useNavigation } from "@react-navigation/native";
import { INatIconButton } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  className?: string,
  handleClose?: Function,
  black?: boolean,
  size?: number,
  icon?: string,
  width?: number,
  height?: number
}

const CloseButton = ( {
  className, handleClose, black, size, icon,
  width, height
}: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <INatIconButton
      icon={icon || "close"}
      size={size}
      className={className}
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
      accessibilityRole="button"
      accessibilityLabel={t( "Close" )}
      accessibilityState={{ disabled: false }}
      accessibilityHint={t( "Returns-to-previous-screen" )}
      disabled={false}
      width={width}
      height={height}
    />
  );
};
export default CloseButton;
