// @flow

import * as React from "react";
import { Text, View } from "react-native";

import UserIcon from "../SharedComponents/UserIcon";
import SmallSquareImage from "./SmallSquareImage";
import { textStyles, viewStyles } from "../../styles/obsDetails";

type Props = {
  ids: Array<Object>
}

const ActivityTab = ( { ids }: Props ): React.Node => ids.map( id => {
  // this should all perform similarly to the activity tab on web
  // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
  return (
    <View key={id.uuid}>
      <View style={viewStyles.userProfileRow}>
        <View style={viewStyles.userProfileRow}>
          <UserIcon uri={id.userIcon} />
          <Text>{`@${id.userLogin}`}</Text>
        </View>
        <Text>{id.body}</Text>
        {id.vision && <Text>vision</Text>}
        <Text>{id.category}</Text>
        {id.createdAt && <Text>time (ago)</Text>}
      </View>
      <View style={viewStyles.speciesDetailRow}>
        <SmallSquareImage uri={id.taxonPhoto} />
        <View>
          <Text style={textStyles.commonNameText}>{id.commonName}</Text>
          <Text style={textStyles.scientificNameText}>{id.rank} {id.name}</Text>
        </View>
      </View>
    </View>
  );
} );

export default ActivityTab;
