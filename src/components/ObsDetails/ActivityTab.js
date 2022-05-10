// @flow

import * as React from "react";
import { View, Text } from "react-native";

import ActivityItem from "./ActivityItem";

type Props = {
  ids: Array<Object>,
  comments: Array<Object>,
  navToTaxonDetails: Function,
  navToUserProfile: number => { }
}

const ActivityTab = ( { comments, ids, navToTaxonDetails, navToUserProfile }: Props ): React.Node => {
  const activitySortedByTime = ( ) => {
    const activity = ids.concat( comments );
    return activity.sort( ( a, b )  => {
      return b.created_at - a.created_at;
    } );
  };

  if ( comments.length === 0 && ids.length === 0 ) {
    return <Text>no comments or ids to display</Text>;
  }

  return activitySortedByTime( ).map( item => {
    const handlePress = ( ) => navToUserProfile( item?.user?.id );
    // this should all perform similarly to the activity tab on web
    // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
    return (
      <View key={item.uuid}>
        <ActivityItem item={item} handlePress={handlePress} navToTaxonDetails={navToTaxonDetails} />
      </View>
    );
  } );
};

export default ActivityTab;
