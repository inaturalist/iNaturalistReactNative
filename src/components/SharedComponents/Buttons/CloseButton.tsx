import { useNavigation } from "@react-navigation/native";
import { INatIconButton } from "components/SharedComponents";
import { t } from "i18next";
import React from "react";
import { useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

interface Props {
  buttonClassName?: string;
  darkGray?: boolean;
  handleClose?: ( ) => void;
  height?: number;
  icon?: string;
  size?: number;
  width?: number;
}

const CloseButton = ( {
  buttonClassName,
  darkGray,
  handleClose,
  height,
  icon,
  size,
  width
}: Props ) => {
  const navigation = useNavigation( );
  const theme = useTheme( );

  return (
    <INatIconButton
      className={buttonClassName}
      icon={icon || "close"}
      size={size}
      color={darkGray
        ? colors.darkGray
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
