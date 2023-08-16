// @flow
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

import ActivityItem from "./ActivityItem";

type Props = {
  observation:Object,
  refetchRemoteObservation: Function,
  activityItems: Array<Object>,
  onIDAgreePressed: Function
}

const ActivityTab = ( {
  observation,
  refetchRemoteObservation,
  activityItems,
  onIDAgreePressed
}: Props ): React.Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;

  // finds the user's most recent id
  const findRecentUserAgreedToID = ( ) => {
    const currentIds = observation?.identifications;
    const userAgree = currentIds.filter( id => id.user?.id === userId );
    return userAgree.length > 0 && userAgree[userAgree.length - 1].current
      ? userAgree[userAgree.length - 1].taxon.id
      : undefined;
  };

  const userAgreedToId = findRecentUserAgreedToID( );

  return (
    <View testID="ActivityTab">
      {activityItems.length === 0
        ? <Body3>{t( "No-comments-or-ids-to-display" )}</Body3>
        : activityItems.map( item => (
          <ActivityItem
            userAgreedId={userAgreedToId}
            key={item.uuid}
            item={item}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            currentUserId={userId}
          />
        ) )}
    </View>
  );
};

export default ActivityTab;
