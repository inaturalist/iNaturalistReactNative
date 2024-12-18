// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body4,
  DisplayTaxonName,
  Heading1,
  ObsStatus,
  Subheading1
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  useTranslation
} from "sharedHooks";

type Props = {
  belongsToCurrentUser: boolean,
  observation: Object,
}

const CommunityTaxon = ( {
  belongsToCurrentUser,
  observation
}: Props ): Node => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { t } = useTranslation( );

  const communityTaxon = observation?.taxon;

  const showCommunityTaxon = ( ) => (
    <DisplayTaxonName
      taxon={communityTaxon}
      handlePress={( ) => (
        navigation.navigate( {
          // Ensure button mashing doesn't open multiple TaxonDetails instances
          key: `${route.key}-CommunityTaxon-TaxonDetails-${communityTaxon.id}`,
          name: "TaxonDetails",
          params: { id: communityTaxon.id }
        } )
      )}
      testID={`ObsDetails.taxon.${communityTaxon.id}`}
      accessibilityHint={t( "Navigates-to-taxon-details" )}
      topTextComponent={Heading1}
      bottomTextComponent={Subheading1}
    />
  );

  return (
    <View className="bg-white px-3">
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
    </View>
  );
};

export default CommunityTaxon;
