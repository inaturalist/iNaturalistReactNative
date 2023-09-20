// @flow

import CheckBox from "@react-native-community/checkbox";
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
import colors from "styles/tailwindColors";

type Props = {
  relationship: Object,
  updateRelationship: Function,
  askToRemoveRelationship: Function
}

const Relationship = ( {
  askToRemoveRelationship,
  relationship,
  updateRelationship
}: Props ): Node => (
  <View style={[viewStyles.column, viewStyles.relationshipRow]}>
    <View style={viewStyles.row}>
      <Image
        style={viewStyles.relationshipImage}
        source={{ uri: relationship.friendUser.icon_url }}
      />
      <View style={viewStyles.column}>
        <Text>{relationship.friendUser.login}</Text>
        <Text>{relationship.friendUser.name}</Text>
      </View>
      <View style={viewStyles.column}>
        <View style={[viewStyles.row, viewStyles.notificationCheckbox]}>
          <CheckBox
            value={relationship.following}
            onValueChange={
              ( ) => { updateRelationship( relationship, { following: !relationship.following } ); }
            }
            tintColors={{ false: colors.inatGreen, true: colors.inatGreen }}
          />
          <Text>{t( "Following" )}</Text>
        </View>
        <View style={[viewStyles.row, viewStyles.notificationCheckbox]}>
          <CheckBox
            value={relationship.trust}
            onValueChange={
              ( ) => { updateRelationship( relationship, { trust: !relationship.trust } ); }
            }
            tintColors={{ false: colors.inatGreen, true: colors.inatGreen }}
          />
          <Text>{t( "Trust-with-hidden-coordinates" )}</Text>
        </View>
      </View>
    </View>
    <Text>{t( "Added-on-date", { date: relationship.created_at } )}</Text>
    <Pressable
      accessibilityRole="button"
      style={viewStyles.removeRelationship}
      onPress={() => askToRemoveRelationship( relationship )}
    >
      <Text>{t( "Remove-Relationship" )}</Text>
    </Pressable>
  </View>
);

export default Relationship;
