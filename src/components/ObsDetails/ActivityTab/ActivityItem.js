// @flow

import { useNavigation } from "@react-navigation/native";
import {
  Divider, INatIconButton, UserText
} from "components/SharedComponents";
import DisplayTaxon from "components/SharedComponents/DisplayTaxon";
import {
  View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React from "react";

import ActivityHeaderContainer from "./ActivityHeaderContainer";
import DisagreementText from "./DisagreementText";

type Props = {
  currentUserId?: number,
  isFirstDisplay: boolean,
  isOnline: boolean,
  item: Object,
  openAgreeWithIdSheet: Function,
  refetchRemoteObservation: Function,
  userAgreedId?: string
}

const ActivityItem = ( {
  currentUserId,
  isFirstDisplay,
  isOnline,
  item,
  openAgreeWithIdSheet,
  refetchRemoteObservation,
  userAgreedId
}: Props ): Node => {
  const navigation = useNavigation( );
  const { taxon, user, disagreement } = item;
  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;
  const showAgreeButton = user?.id !== currentUserId
    && userAgreedId !== taxon?.id
    && taxon?.is_active
    && isFirstDisplay
    && currentUserId;

  console.log( currentUserId );

  const navToTaxonDetails = ( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } );

  return (
    <View className="flex-column">
      <View className="mx-[15px] pb-[7px]">
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
              accessibilityHint={t( "Navigates-to-taxon-details" )}
              withdrawn={idWithdrawn}
            />
            { showAgreeButton && (
              <INatIconButton
                testID={`ActivityItem.AgreeIdButton.${item.taxon.id}`}
                onPress={( ) => openAgreeWithIdSheet( item.taxon )}
                icon="id-agree"
                size={33}
                accessibilityLabel={t( "Agree" )}
              />
            )}
          </View>
        )}
        { !_.isEmpty( item?.body ) && (
          <View className="flex-row">
            <UserText text={item.body} />
          </View>
        )}
        { disagreement && (
          <DisagreementText
            taxon={item.previous_observation_taxon}
            username={user.login}
            withdrawn={idWithdrawn}
          />
        )}
      </View>
      <Divider />
    </View>
  );
};

export default ActivityItem;
