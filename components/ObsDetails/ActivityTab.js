// @flow

import * as React from "react";
import { Text, View } from "react-native";

import SmallUserIcon from "./SmallUserIcon";
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
          <SmallUserIcon uri={id.user.icon_url} />
          <Text>{`@${id.user.login}`}</Text>
        </View>
        <Text>{id.body}</Text>
        {id.vision && <Text>vision</Text>}
        <Text>{id.category}</Text>
        {id.created_at && <Text>time (ago)</Text>}
      </View>
      <View style={viewStyles.speciesDetailRow}>
        <SmallSquareImage uri={id.taxon.default_photo.square_url} />
        <View>
          <Text style={textStyles.commonNameText}>{id.taxon.preferred_common_name}</Text>
          <Text style={textStyles.scientificNameText}>{id.taxon.rank} {id.taxon.name}</Text>
        </View>
      </View>
    </View>
  );
    // <Text>default photo name</Text>
    //       <Text>{observation.commonName}</Text>
    //       <Text>comments</Text>
    //       <Text>agree button</Text>
} );

export default ActivityTab;
