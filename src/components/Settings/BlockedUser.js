// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View
} from "react-native";
import { viewStyles } from "styles/settings/settings";

type Props = {
  unblockUser: Function,
  user: Object
}

const BlockedUser = ( { user, unblockUser }:Props ): Node => (
  <View style={[viewStyles.row, viewStyles.relationshipRow]}>
    <Image
      style={viewStyles.relationshipImage}
      source={{ uri: user.icon }}
      accessibilityIgnoresInvertColors
    />
    <View style={viewStyles.column}>
      <Text>{user.login}</Text>
      <Text>{user.name}</Text>
    </View>
    <Pressable
      accessibilityRole="button"
      style={viewStyles.removeRelationship}
      onPress={unblockUser}
    >
      <Text>{t( "Unblock" )}</Text>
    </Pressable>
  </View>
);

export default BlockedUser;
