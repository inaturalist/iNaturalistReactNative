// @flow

import type { Node } from "react";
import React, { useState } from "react";
import { Button, Menu } from "react-native-paper";

import colors from "../../styles/colors";
import { viewStyles } from "../../styles/sharedComponents/kebabMenu";

type Props = {
  children: any
}

const KebabMenu = ( { children }: Props ): Node => {
  const [visible, setVisible] = useState( false );

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
