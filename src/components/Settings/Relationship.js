// @flow

import { Checkbox } from "components/SharedComponents";
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
        <Checkbox
          isChecked={relationship.following}
          onPress={
            ( ) => { updateRelationship( relationship, { following: !relationship.following } ); }
          }
          text={t( "Following" )}
        />
        <Checkbox
          isChecked={relationship.trust}
          onPress={
            ( ) => { updateRelationship( relationship, { trust: !relationship.trust } ); }
          }
          text={t( "Trust-with-hidden-coordinates" )}
        />
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
