// @flow

import type { Node } from "react";
import React from "react";
import { IconButton, Menu } from "react-native-paper";
import viewStyles from "styles/sharedComponents/kebabMenu";

type Props = {
  children: any,
  visible: boolean,
  setVisible: Function
}

const KebabMenu = ( { children, visible, setVisible }: Props ): Node => {
  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  const anchorButton = (
    <IconButton
      onPress={openMenu}
      icon="triple-dots"
      testID="KebabMenu.Button"
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
