// @flow
import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import {
  ActivityIndicator,
  Body1,
  Body4,
  DateDisplay,
  DisplayTaxon,
  InlineUser,
  ObservationLocation,
  ObsStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

type Props = {
  belongsToCurrentUser?: boolean,
  isOnline: boolean,
  isRefetching: boolean,
  observation: any,
}

const ObsDetailsOverview = ( {
  belongsToCurrentUser,
  isOnline,
  isRefetching,
  observation
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const communityTaxon = observation?.taxon;

  const loadingIndicator = (
    <ActivityIndicator
      className={classnames(
        "absolute w-full"
      )}
      size={25}
    />
  );

  const showCommunityTaxon = ( ) => {
    if ( !communityTaxon ) {
      return (
        <View className="justify-center ml-1">
          <Body1>{t( "Unknown--taxon" )}</Body1>
        </View>
      );
    }
    return (
      <DisplayTaxon
        taxon={communityTaxon}
        handlePress={( ) => navigation.navigate( "TaxonDetails", { id: communityTaxon.id } )}
        testID={`ObsDetails.taxon.${communityTaxon.id}`}
        accessibilityHint={t( "Navigates-to-taxon-details" )}
      />
    );
  };

  return (
    <View className="bg-white">
      <View className="flex-row justify-between mx-[15px] mt-[13px]">
        {( !observation || isRefetching ) && loadingIndicator}
        <InlineUser user={observation?.user} isOnline={isOnline} />
        {observation && (
          <DateDisplay
            dateString={
              observation.time_observed_at || observation.observed_on_string
            }
          />
        )}
      </View>
      <View className="flex-row my-[11px] mx-3 items-center">
        <View className="shrink">
          {observation && showCommunityTaxon( )}
        </View>
        <View className="ml-auto">
          <ObsStatus layout="vertical" observation={observation} />
        </View>
      </View>
      {
        (
          observation?.prefersCommunityTaxon === false
          || observation?.user?.prefers_community_taxa === false
        ) && (
          <Body4 className="mx-3 mt-0 mb-2 italic">
            {
              belongsToCurrentUser
                ? t( "You-have-opted-out-of-the-Community-Taxon" )
                : t( "This-observer-has-opted-out-of-the-Community-Taxon" )
            }
          </Body4>
        )
      }
      <ObservationLocation observation={observation} classNameMargin="mx-3 mb-2" />
    </View>
  );
};

export default ObsDetailsOverview;
