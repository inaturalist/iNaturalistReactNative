// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import {
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
  belongsToCurrentUser: boolean,
  isConnected: boolean,
  observation: Object,
};

const ObsDetailsOverview = ( {
  belongsToCurrentUser,
  isConnected,
  observation
}: Props ): Node => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { t } = useTranslation( );
  const geoprivacy = observation?.geoprivacy;
  const taxonGeoprivacy = observation?.taxon_geoprivacy;

  const communityTaxon = observation?.taxon;

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
        handlePress={( ) => (
          navigation.navigate( {
            // Ensure button mashing doesn't open multiple TaxonDetails instances
            key: `${route.key}-ObsDetailsOverview-TaxonDetails-${communityTaxon.id}`,
            name: "TaxonDetails",
            params: { id: communityTaxon.id }
          } )
        )}
        testID={`ObsDetails.taxon.${communityTaxon.id}`}
        accessibilityHint={t( "Navigates-to-taxon-details" )}
      />
    );
  };

  return (
    <View className="bg-white">
      <View className="flex-row justify-between mx-[15px] mt-[13px]">
        <InlineUser user={observation?.user} isConnected={isConnected} />
        {observation && (
          <DateDisplay
            dateString={
              observation.time_observed_at
              || observation.observed_on_string
              || observation.observed_on
            }
            geoprivacy={geoprivacy}
            taxonGeoprivacy={taxonGeoprivacy}
            belongsToCurrentUser={belongsToCurrentUser}
            maxFontSizeMultiplier={1}
            timeZone={observation.observed_time_zone}
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
      <ObservationLocation
        observation={observation}
        obscured={observation?.obscured}
        classNameMargin="mx-3 mb-2"
      />
    </View>
  );
};

export default ObsDetailsOverview;
