// @flow

import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { Node } from "react";
import React from "react";
import { Menu } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  children: any,
  large?: boolean,
  setVisible: Function,
  visible: boolean,
  white?: boolean,
}

const KebabMenu = ( {
  accessibilityHint,
  accessibilityLabel,
  children,
  large,
  setVisible,
  visible,
  white
}: Props ): Node => {
  const { t } = useTranslation( );
  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  const menuContentStyle = {
    backgroundColor: colors.white
  };

  const anchorButton = (
    <INatIconButton
      onPress={openMenu}
      icon="kebab-menu"
      testID="KebabMenu.Button"
      size={large
        ? 26
        : 15}
      accessibilityLabel={accessibilityLabel || t( "Menu" )}
      accessibilityHint={accessibilityHint || t( "Open-menu" )}
      color={white
        ? colors.white
        : colors.black}
    />
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={menuContentStyle}
      anchor={anchorButton}
    >
      {children}
    </Menu>
  );
};

export default KebabMenu;
