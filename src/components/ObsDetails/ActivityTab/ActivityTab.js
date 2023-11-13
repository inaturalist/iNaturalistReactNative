// @flow
import { View } from "components/styledComponents";
import * as React from "react";
import { useCurrentUser } from "sharedHooks";

import ActivityItem from "./ActivityItem";

type Props = {
  observation:Object,
  refetchRemoteObservation: Function,
  activityItems: Array<Object>,
  onIDAgreePressed: Function,
  isOnline: boolean
}

const ActivityTab = ( {
  observation,
  refetchRemoteObservation,
  activityItems,
  onIDAgreePressed,
  isOnline
}: Props ): React.Node => {
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
      {activityItems.length > 0
        && activityItems.map( item => (
          <ActivityItem
            userAgreedId={userAgreedToId}
            key={item.uuid}
            item={item}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            currentUserId={userId}
            isOnline={isOnline}
          />
        ) )}
    </View>
  );
};

export default ActivityTab;
