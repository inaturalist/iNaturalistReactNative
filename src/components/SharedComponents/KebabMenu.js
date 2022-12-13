// @flow

import type { Node } from "react";
import React from "react";
import { Button, Menu } from "react-native-paper";
import viewStyles from "styles/sharedComponents/kebabMenu";
import colors from "styles/tailwindColors";

type Props = {
  children: any,
  visible: boolean,
  setVisible: Function
}

const KebabMenu = ( { children, visible, setVisible }: Props ): Node => {
  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  const anchorButton = (
    <Button
      onPress={openMenu}
      icon="dots-horizontal"
      textColor={colors.logInGray}
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
