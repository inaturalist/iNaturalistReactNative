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
  currentUserId?: Number,
  isFirstDisplay: boolean,
  isOnline: boolean,
  item: Object,
  onIDAgreePressed: Function,
  refetchRemoteObservation: Function,
  userAgreedId?: string
}

const ActivityItem = ( {
  currentUserId,
  isFirstDisplay,
  isOnline,
  item,
  onIDAgreePressed,
  refetchRemoteObservation,
  userAgreedId
}: Props ): Node => {
  const navigation = useNavigation( );
  const { taxon, user } = item;
  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;

  const showAgreeButton = user?.id !== currentUserId
    && userAgreedId !== taxon?.id
    && taxon?.is_active
    && isFirstDisplay;

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
              testID={`ActivityItem.AgreeIdButton.${item.taxon.id}`}
              accessibilityRole="button"
              onPress={( ) => onIDAgreePressed( item.taxon )}
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
