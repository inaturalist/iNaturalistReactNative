// @flow
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body4,
  DisplayTaxonName,
  Heading1,
  Subheading1
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
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
  const taxonId = communityTaxon?.id || "unknown";

  const showCommunityTaxon = ( ) => (
    <DisplayTaxonName
      taxon={communityTaxon}
      testID={`ObsDetails.taxon.${taxonId}`}
      accessibilityHint={t( "Navigates-to-taxon-details" )}
      topTextComponent={Heading1}
      bottomTextComponent={Subheading1}
    />
  );

  const handlePress = ( ) => navigation.navigate( {
    // Ensure button mashing doesn't open multiple TaxonDetails instances
    key: `${route.key}-CommunityTaxon-TaxonDetails-${taxonId}`,
    name: "TaxonDetails",
    params: { id: taxonId }
  } );

  return (
    <View className="bg-white px-5 pt-5">
      <View className="flex-row my-[11px] items-center">
        <Pressable
          accessibilityRole="button"
          className="shrink"
          onPress={handlePress}
          testID={`ObsDetails.taxon.${taxonId}`}
        >
          {observation && showCommunityTaxon( )}
        </Pressable>
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
