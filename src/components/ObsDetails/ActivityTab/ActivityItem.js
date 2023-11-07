// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Divider, INatIcon, UserText
} from "components/SharedComponents";
import DisplayTaxon from "components/SharedComponents/DisplayTaxon";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React from "react";
import { textStyles } from "styles/obsDetails/obsDetails";

import ActivityHeaderContainer from "./ActivityHeaderContainer";

type Props = {
  item: Object,
  refetchRemoteObservation: Function,
  currentUserId?: Number,
  userAgreedId?: string,
  onIDAgreePressed: Function,
  isOnline: boolean
}

const ActivityItem = ( {
  item, refetchRemoteObservation, currentUserId,
  userAgreedId, onIDAgreePressed,
  isOnline
}: Props ): Node => {
  const navigation = useNavigation( );
  const { taxon, user } = item;
  const userId = currentUserId;
  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;

  const showAgreeButton = ( user?.id !== userId )
      && taxon?.rank_level <= 10
      && ( userAgreedId !== taxon?.id );

  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  return (
    <View className="flex-column ml-[15px]">
      <ActivityHeaderContainer
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        idWithdrawn={idWithdrawn}
        isOnline={isOnline}
      />
      {taxon && (
        <View className="flex-row items-center justify-between mr-[23px] mb-4">
          <DisplayTaxon
            taxon={taxon}
            handlePress={navToTaxonDetails}
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
            withdrawn={idWithdrawn}
          />
          { showAgreeButton && (
            <Pressable
              testID="ActivityItem.AgreeIdButton"
              accessibilityRole="button"
              onPress={onIDAgreePressed}
            >
              <INatIcon name="id-agree" size={33} />
            </Pressable>
          )}
        </View>
      )}
      { !_.isEmpty( item?.body ) && (
        <View className="flex-row">
          <UserText baseStyle={textStyles.activityItemBody} text={item.body} />
        </View>
      )}
      <Divider />
    </View>
  );
};

export default ActivityItem;
