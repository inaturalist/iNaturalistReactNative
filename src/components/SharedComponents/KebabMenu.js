// @flow

import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { Node } from "react";
import React from "react";
import { Menu } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import viewStyles from "styles/sharedComponents/kebabMenu";
import colors from "styles/tailwindColors";

type Props = {
  children: any,
  visible: boolean,
  setVisible: Function,
  large?: boolean,
  white?: boolean
}

const KebabMenu = ( {
  children, visible, setVisible, large, white
}: Props ): Node => {
  const { t } = useTranslation( );
  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  const anchorButton = (
    <INatIconButton
      onPress={openMenu}
      icon="kebab-menu"
      testID="KebabMenu.Button"
      size={large
        ? 26
        : 15}
      accessibilityLabel={t( "Kebab-menu" )}
      accessibilityHint={t( "Open-kebab-menu" )}
      color={white
        ? colors.white
        : colors.black}
    />
  );

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={viewStyles.menuContentStyle}
      anchor={anchorButton}
    >
      {children}
    </Menu>
  );
};

export default KebabMenu;
