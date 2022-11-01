// @flow

import { t } from "i18next";
import * as React from "react";
import { Text, View } from "react-native";

import ActivityItem from "./ActivityItem";

type Props = {
  ids: Array<Object>,
  comments: Array<Object>,
  navToTaxonDetails: Function,
  navToUserProfile: number => { },
  toggleRefetch: Function,
  refetchRemoteObservation: Function
}

const ActivityTab = ( {
  comments, ids, navToTaxonDetails, navToUserProfile, toggleRefetch, refetchRemoteObservation
}: Props ): React.Node => {
  if ( comments.length === 0 && ids.length === 0 ) {
    return <Text>{t( "No-comments-or-ids-to-display" )}</Text>;
  }

  const activityItems = ids.concat( comments )
    .sort( ( a, b ) => ( b.created_at - a.created_at ) );

  return activityItems.map( item => {
    const handlePress = ( ) => navToUserProfile( item?.user?.id );
    // this should all perform similarly to the activity tab on web
    // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
    return (
      <View key={item.uuid}>
        <ActivityItem
          item={item}
          handlePress={handlePress}
          navToTaxonDetails={navToTaxonDetails}
          toggleRefetch={toggleRefetch}
          refetchRemoteObservation={refetchRemoteObservation}
        />
      </View>
    );
  } );
};

export default ActivityTab;
