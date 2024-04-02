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
  buttonClassName?: string,
  size?: number,
  icon?: string,
  width?: number,
  height?: number
}

const CloseButton = ( {
  black,
  buttonClassName,
  handleClose,
  height,
  icon,
  size,
  width
}: Props ): Node => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <INatIconButton
      className={buttonClassName}
      icon={icon || "close"}
      size={size}
      color={black
        ? theme.colors.tertiary
        : theme.colors.background}
      onPress={( ) => {
        if ( handleClose ) {
          handleClose( navigation );
        } else {
          navigation.goBack( );
        }
      }}
      accessibilityLabel={t( "Close" )}
      accessibilityHint={t( "Navigates-to-previous-screen" )}
      disabled={false}
      width={width}
      height={height}
    />
  );
};
export default CloseButton;
