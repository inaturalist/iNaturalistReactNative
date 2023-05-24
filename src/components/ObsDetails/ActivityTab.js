// @flow
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

import ActivityItem from "./ActivityItem";

type Props = {
  observation:Object,
  comments:Array<Object>,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function,
}

const ActivityTab = ( {
  observation, comments, navToTaxonDetails,
  toggleRefetch, refetchRemoteObservation
}: Props ): React.Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const [ids, setIds] = useState<Array<Object>>( [] );

  useEffect( ( ) => {
    // set initial ids for activity tab
    const currentIds = observation?.identifications;
    if ( currentIds
        && ids.length === 0
        && currentIds.length !== ids.length ) {
      setIds( currentIds );
    }
  }, [observation, ids] );

  if ( comments.length === 0 && ids.length === 0 ) {
    return <Text>{t( "No-comments-or-ids-to-display" )}</Text>;
  }

  const activityItems = ids.concat( [...comments] )
    .sort( ( a, b ) => ( new Date( a.created_at ) - new Date( b.created_at ) ) );

  // this should all perform similarly to the activity tab on web
  // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/components/activity_item.jsx
  const activitytemsList = activityItems.map( item => (
    <ActivityItem
      key={item.uuid}
      item={item}
      navToTaxonDetails={navToTaxonDetails}
      toggleRefetch={toggleRefetch}
      refetchRemoteObservation={refetchRemoteObservation}
      onAgree={() => {}}
      currentUserId={userId}
    />
  ) );

  return (
    <View testID="ActivityTab">
      {activitytemsList}
    </View>
  );
};

export default ActivityTab;
