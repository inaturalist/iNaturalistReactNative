// @flow

import * as React from "react";
import { Text, View, Pressable } from "react-native";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles } from "../../styles/obsDetails";

type Props = {
  ids: Array<Object>,
  navToTaxonDetails: ( ) => { },
  navToUserProfile: number => { }
}

const ActivityTab = ( { ids, navToTaxonDetails, navToUserProfile }: Props ): React.Node => ids.map( id => {
  const taxon = id.taxon;
  const handlePress = ( ) => navToUserProfile( id.user.id );
  // this should all perform similarly to the activity tab on web
  // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
  return (
    <View key={id.uuid}>
      <View style={viewStyles.userProfileRow}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="link"
          style={viewStyles.userProfileRow}
          testID={`ObsDetails.identifier.${id.user.id}`}
        >
          <UserIcon uri={id.user.iconUrl} />
          <Text>{`@${id.user.login}`}</Text>
        </Pressable>
        <Text>{id.body}</Text>
        {id.vision && <Text>vision</Text>}
        <Text>{id.category}</Text>
        {id.createdAt && <Text>time (ago)</Text>}
      </View>
      <Pressable style={viewStyles.speciesDetailRow} onPress={navToTaxonDetails}>
        <SmallSquareImage uri={taxon.defaultPhotoSquareUrl} />
        <View>
          <Text style={textStyles.commonNameText}>{taxon.preferredCommonName}</Text>
          <Text style={textStyles.scientificNameText}>{taxon.rank} {taxon.name}</Text>
        </View>
      </Pressable>
    </View>
  );
} );

export default ActivityTab;
