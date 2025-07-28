// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body4,
  Divider, INatIconButton, UserText
} from "components/SharedComponents";
import DisplayTaxon from "components/SharedComponents/DisplayTaxon.tsx";
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
  isConnected: boolean,
  item: Object,
  openAgreeWithIdSheet: Function,
  refetchRemoteObservation: Function,
  userAgreedId?: string,
  geoprivacy: string,
  taxonGeoprivacy: string,
  belongsToCurrentUser: boolean,
  showExplainerText: boolean
}

const ActivityItem = ( {
  currentUserId,
  isFirstDisplay,
  isConnected,
  item,
  openAgreeWithIdSheet,
  refetchRemoteObservation,
  userAgreedId,
  geoprivacy,
  taxonGeoprivacy,
  belongsToCurrentUser,
  showExplainerText
}: Props ): Node => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { taxon, user, disagreement } = item;
  const isCurrent = item.current !== undefined
    ? item.current
    : undefined;

  const isHidden = item.hidden;

  const idWithdrawn = isCurrent !== undefined && !isCurrent;
  const showAgreeButton = user?.id !== currentUserId
    && userAgreedId !== taxon?.id
    && taxon?.is_active
    && isFirstDisplay
    && currentUserId;

  const navToTaxonDetails = ( ) => (
    navigation.navigate( {
      // Ensure button mashing doesn't open multiple TaxonDetails instances
      key: `${route.key}-ActivityItem-TaxonDetails-${taxon.id}`,
      name: "TaxonDetails",
      params: { id: taxon.id }
    } )
  );

  // we're doing this filtering directly in useRemoteObservation and useLocalObservation
  // to make sure we're not displaying hidden content, but this is an extra safeguard
  if ( isHidden ) {
    return null;
  }

  return (
    <View testID="ObsDetailsDefaultMode.ActivityItem">
      <View className="mx-[15px] pb-[7px]">
        <ActivityHeaderContainer
          item={item}
          refetchRemoteObservation={refetchRemoteObservation}
          idWithdrawn={idWithdrawn}
          isConnected={isConnected}
          geoprivacy={geoprivacy}
          taxonGeoprivacy={taxonGeoprivacy}
          belongsToCurrentUser={belongsToCurrentUser}
        />
        {taxon && (
          <View className="flex-row items-center justify-between mb-4 mt-1">
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
        {/*
          Only show explainer text if we are on the user's obs, if it is an ID of this user
          and the user has in total less than 10 obs (handled in HOC)
        */}
        { showExplainerText
          && belongsToCurrentUser
          && taxon
          && user?.id === currentUserId
          && (
            <Body4 className="py-2 font-Lato-Italic">
              {t(
                "This-is-your-identification-other-people-may-help-confirm-it"
              )}
            </Body4>
          )}
      </View>
      <Divider />
    </View>
  );
};

export default ActivityItem;
