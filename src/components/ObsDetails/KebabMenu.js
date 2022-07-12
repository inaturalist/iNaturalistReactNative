// @flow

import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  Button, DefaultTheme, Menu, Provider
} from "react-native-paper";
import Realm from "realm";

import Comment from "../../models/Comment";
import realmConfig from "../../models/index";
import colors from "../../styles/colors";
import { viewStyles } from "../../styles/obsDetails/obsDetails";

type Props = {
  uuid: string,
  toggleRefetch: Function
}

const KebabMenu = ( { uuid, toggleRefetch }: Props ): Node => {
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );

  const openMenu = ( ) => setVisible( true );
  const closeMenu = ( ) => setVisible( false );

  return (
    <Provider theme={DefaultTheme}>
      {/* need View here to keep kebab menu on top of other components */}
      <View style={viewStyles.kebabMenuWrapper}>
        <Menu
          visible={visible}
          onDismiss={closeMenu}
          style={viewStyles.kebabMenuPlacement}
          contentStyle={viewStyles.textPadding}
          anchor={
            <Button onPress={openMenu} icon="dots-horizontal" textColor={colors.logInGray} />
          }
        >
          <Menu.Item
            onPress={async ( ) => {
              const realm = await Realm.open( realmConfig );
              Comment.deleteComment( uuid, realm );
              toggleRefetch( );
            }}
            title={t( "Delete-comment" )}
          />
        </Menu>
      </View>
    </Provider>
  );
};

export default KebabMenu;
