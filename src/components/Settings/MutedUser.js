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
  unmuteUser: Function,
  user: Object
}

const MutedUser = ( { user, unmuteUser }: Props ): Node => (
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
      onPress={unmuteUser}
    >
      <Text>{t( "Unmute" )}</Text>
    </Pressable>
  </View>
);

export default MutedUser;
