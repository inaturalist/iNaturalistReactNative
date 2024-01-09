// @flow
import { View } from "components/styledComponents";
import { compact } from "lodash";
import type { Node } from "react";
import React, { useMemo } from "react";
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
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;

  // finds the user's most recent id
  const findRecentUserAgreedToID = ( ) => {
    const currentIds = observation?.identifications;
    const userAgree = currentIds?.filter( id => id.user?.id === userId );
    return userAgree?.length > 0 && userAgree[userAgree.length - 1].current
      ? userAgree[userAgree.length - 1].taxon.id
      : undefined;
  };

  const userAgreedToId = findRecentUserAgreedToID( );

  const stableItems = useMemo(
    ( ) => compact( activityItems ).map(
      item => (
        item.toJSON
          ? item.toJSON( )
          : item
      )
    ),
    [activityItems]
  );

  const indexOfFirstTaxonDisplayed = taxonId => stableItems
    .findIndex( item => item.taxon.id === taxonId );

  return (
    <View testID="ActivityTab">
      {stableItems.length > 0
        && stableItems.map( ( item, index ) => (
          <ActivityItem
            userAgreedId={userAgreedToId}
            key={item.uuid}
            item={item}
            refetchRemoteObservation={refetchRemoteObservation}
            onIDAgreePressed={onIDAgreePressed}
            currentUserId={userId}
            isOnline={isOnline}
            isFirstDisplay={index === indexOfFirstTaxonDisplayed( item.taxon?.id )}
          />
        ) )}
    </View>
  );
};

export default ActivityTab;
