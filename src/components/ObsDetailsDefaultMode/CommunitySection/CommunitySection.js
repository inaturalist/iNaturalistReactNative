// @flow
import { Body2, Divider, Heading3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { compact } from "lodash";
import type { Node } from "react";
import React, { useMemo } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

import ActivityItem from "./ActivityItem";

type Props = {
  observation:Object,
  refetchRemoteObservation: Function,
  activityItems: Array<Object>,
  openAgreeWithIdSheet: Function,
  isConnected: boolean,
  targetItemID: number,
  // TODO change to LayoutEvent from react-native if/when switching to TS
  onLayoutTargetItem: ( event: Object ) => void
}

const ActivitySection = ( {
  observation,
  refetchRemoteObservation,
  activityItems,
  openAgreeWithIdSheet,
  isConnected,
  targetItemID,
  onLayoutTargetItem
}: Props ): Node => {
  const { t } = useTranslation( );
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
    <View testID="CommunitySection">
      <Heading3 className="m-4">{t( "Community-Discussion" )}</Heading3>
      <Divider />
      {stableItems.length === 0
        ? (
          <Body2 className="text-center mt-12 px-[45px]">
            {t( "This-observation-has-no-comments-or-identifications-yet" )}
          </Body2>
        )
        : stableItems.map( ( item, index ) => (
          <View
            onLayout={event => {
              if ( targetItemID === item?.id ) {
                const { layout } = event.nativeEvent;
                onLayoutTargetItem( layout );
              }
            }}
            key={item.uuid}
          >
            <ActivityItem
              currentUserId={userId}
              isFirstDisplay={index === indexOfFirstTaxonDisplayed( item.taxon?.id )}
              isConnected={isConnected}
              item={item}
              openAgreeWithIdSheet={openAgreeWithIdSheet}
              refetchRemoteObservation={refetchRemoteObservation}
              userAgreedId={userAgreedToId}
              geoprivacy={geoprivacy}
              taxonGeoprivacy={taxonGeoprivacy}
              belongsToCurrentUser={belongsToCurrentUser}
              showExplainerText={currentUser?.observations_count < 10}
            />
          </View>
        ) )}
    </View>
  );
};

export default ActivitySection;
