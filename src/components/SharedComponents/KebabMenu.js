// @flow

import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import type { Node } from "react";
import React from "react";
import { Menu } from "react-native-paper";
import viewStyles from "styles/sharedComponents/kebabMenu";

type Props = {
  children: any,
  visible: boolean,
  setVisible: Function,
  large?: boolean
}

const KebabMenu = ( {
  children, visible, setVisible, large
}: Props ): Node => {
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
