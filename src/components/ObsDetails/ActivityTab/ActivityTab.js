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
  openAgreeWithIdSheet: Function,
  isConnected: boolean,
  notificationId: number,
  setScrollToY: ( number ) => void
}

const ActivityTab = ( {
  observation,
  refetchRemoteObservation,
  activityItems,
  openAgreeWithIdSheet,
  isConnected,
  notificationId,
  setScrollToY
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;
  const belongsToCurrentUser = observation?.user?.login === currentUser?.login;

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
    .findIndex( item => item?.taxon?.id === taxonId );

  return (
    <View testID="ActivityTab">
      {stableItems.length > 0
        && stableItems.map( ( item, index ) => (
          <View
            onLayout={event => {
              if ( notificationId === item?.id ) {
                const { layout } = event.nativeEvent;
                setScrollToY( layout.y );
              }
            }}
          >
            <ActivityItem
              currentUserId={userId}
              isFirstDisplay={index === indexOfFirstTaxonDisplayed( item.taxon?.id )}
              isConnected={isConnected}
              item={item}
              key={item.uuid}
              openAgreeWithIdSheet={openAgreeWithIdSheet}
              refetchRemoteObservation={refetchRemoteObservation}
              userAgreedId={userAgreedToId}
              geoprivacy={geoprivacy}
              taxonGeoprivacy={taxonGeoprivacy}
              belongsToCurrentUser={belongsToCurrentUser}
            />
          </View>
        ) )}
    </View>
  );
};

export default ActivityTab;
