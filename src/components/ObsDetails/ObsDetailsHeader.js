// @flow
import { useNavigation } from "@react-navigation/native";
import {
  Body1,
  Body4,
  DateDisplay, DisplayTaxon, InlineUser, ObservationLocation
} from "components/SharedComponents";
import ObsStatus from "components/SharedComponents/ObservationsFlashList/ObsStatus";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

type Props = {
  belongsToCurrentUser?: boolean,
  observation: Object,
  isOnline: boolean,
}

const ObsDetailsHeader = ( {
  belongsToCurrentUser,
  observation,
  isOnline
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  const taxon = observation?.taxon;

  const showTaxon = () => {
    if ( !taxon ) {
      return (
        <View className="justify-center ml-1">
          <Body1>{t( "Unknown" )}</Body1>
        </View>
      );
    }
    return (
      <DisplayTaxon
        taxon={taxon}
        handlePress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
        testID={`ObsDetails.taxon.${taxon.id}`}
        accessibilityLabel={t( "Navigate-to-taxon-details" )}
      />
    );
  };

  return (
    <View className="bg-white">
      <View className="flex-row justify-between mx-[15px] mt-[13px]">
        <InlineUser user={observation?.user} isOnline={isOnline} />
        <DateDisplay
          dateString={
            observation.time_observed_at || observation.observed_on_string
          }
        />
      </View>
      <View className="flex-row my-[11px] mx-3 items-center">
        <View className="shrink">
          {showTaxon()}
        </View>
        <View className="ml-auto">
          <ObsStatus layout="vertical" observation={observation} />
        </View>
      </View>
      {
        (
          observation.prefersCommunityTaxon === false
          || observation.user?.prefers_community_taxa === false
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

export default ObsDetailsHeader;
