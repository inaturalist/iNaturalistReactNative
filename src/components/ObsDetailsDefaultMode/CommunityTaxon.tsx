import { useNavigation, useRoute } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import {
  Body1,
  Body4,
  DisplayTaxon,
  DisplayTaxonName,
  Heading1,
  Subheading1,
  Subheading2,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import type { RealmTaxon } from "realmModels/types";
import {
  useTranslation,
} from "sharedHooks";

interface Props {
  belongsToCurrentUser: boolean;
  isSimpleMode?: boolean;
  observation: {
    taxon?: RealmTaxon | ApiTaxon | null;
    prefersCommunityTaxon?: boolean | null;
    user?: { prefers_community_taxa?: boolean | null };
  };
}

const CommunityTaxon = ( {
  belongsToCurrentUser,
  isSimpleMode = false,
  observation,
}: Props ) => {
  const navigation = useNavigation( );
  const route = useRoute( );
  const { t } = useTranslation( );

  const communityTaxon = observation?.taxon;
  const taxonId = communityTaxon?.id || "unknown";

  // TS error: keyed navigate() calls don't match the navigator's param types (as in TaxonGridItem).
  // Fix in one pass over all keyed navigate() calls rather than file by file.
  const handlePress = ( ) => navigation.navigate( {
    // Ensure button mashing doesn't open multiple TaxonDetails instances
    key: `${route.key}-CommunityTaxon-TaxonDetails-${taxonId}`,
    name: "TaxonDetails",
    params: { id: taxonId },
  } );

  const showCommunityTaxon = ( ) => {
    if ( !communityTaxon ) {
      return (
        <View className="justify-center ml-1">
          <Subheading2>{t( "Unknown--taxon" )}</Subheading2>
        </View>
      );
    }

    return isSimpleMode
      ? (
        <DisplayTaxon
          taxon={communityTaxon}
          testID={`ObsDetails.taxon.${taxonId}`}
          accessibilityHint={t( "Navigates-to-taxon-details" )}
          handlePress={handlePress}
          topTextComponent={Subheading2}
          bottomTextComponent={Body1}
        />
      )
      : (
        <Pressable
          accessibilityRole="button"
          accessibilityHint={t( "Navigates-to-taxon-details" )}
          className="shrink"
          onPress={handlePress}
          testID={`ObsDetails.taxon.${taxonId}`}
        >
          <DisplayTaxonName
            taxon={communityTaxon}
            topTextComponent={Heading1}
            bottomTextComponent={Subheading1}
          />
        </Pressable>
      );
  };

  return (
    <View className={isSimpleMode
      ? "bg-white px-[15px] pt-[15px]"
      : "bg-white px-5 pt-5"}
    >
      <View className={isSimpleMode
        ? "flex-row items-center"
        : "flex-row my-[11px] items-center"}
      >
        {observation && showCommunityTaxon( )}
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
