// @flow

import ActivityHeader from "components/ObsDetails/ActivityHeader";
import { DisplayTaxonName } from "components/SharedComponents";
import INatIcon from "components/SharedComponents/INatIcon";
import UserText from "components/SharedComponents/UserText";
import {
  Pressable, View
} from "components/styledComponents";
import { t } from "i18next";
import _ from "lodash";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Taxon from "realmModels/Taxon";
import useIsConnected from "sharedHooks/useIsConnected";
import { textStyles } from "styles/obsDetails/obsDetails";

import TaxonImage from "./TaxonImage";

type Props = {
  item: Object,
  navToTaxonDetails: Function,
  toggleRefetch: Function,
  refetchRemoteObservation: Function,
  onAgree: Function,
  currentUserId?: Number
}

const ActivityItem = ( {
  item, navToTaxonDetails, toggleRefetch, refetchRemoteObservation, onAgree, currentUserId
}: Props ): Node => {
  const { taxon, user } = item;
  const isOnline = useIsConnected( );
  const userId = currentUserId;
  const showAgree = taxon && user && user.id !== userId && taxon.rank_level <= 10;

  const showNoInternetIcon = accessibilityLabel => (
    <View className="mr-3">
      <IconMaterial
        name="wifi-off"
        size={30}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );

  return (
    <View className="flex-column ml-[15px]">
      <ActivityHeader
        item={item}
        refetchRemoteObservation={refetchRemoteObservation}
        toggleRefetch={toggleRefetch}
      />
      {taxon && (
        <View className="flex-row items-center justify-between mr-[23px]">
          <Pressable
            className="flex-row mb-[13.5px] items-center w-2/3"
            onPress={navToTaxonDetails}
            accessibilityRole="link"
            accessibilityLabel={t( "Navigate-to-taxon-details" )}
          >
            {isOnline
              ? <TaxonImage uri={Taxon.uri( taxon )} />
              : showNoInternetIcon( t( "Taxon-photo-unavailable-without-internet" ) )}
            <DisplayTaxonName scientificNameFirst={false} taxon={taxon} layout="horizontal" />
          </Pressable>
          { showAgree && (
            <Pressable
              accessibilityRole="button"
              onPress={() => onAgree( item )}
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
    </View>
  );
};

export default ActivityItem;
