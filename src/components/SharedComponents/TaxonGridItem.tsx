import { useNavigation, useRoute } from "@react-navigation/native";
import type { ApiTaxon } from "api/types";
import ObsImagePreview from "components/ObservationsFlashList/ObsImagePreview.tsx";
import { Body4, DisplayTaxonName } from "components/SharedComponents";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import { Pressable, View } from "components/styledComponents";
import React from "react";
import Photo from "realmModels/Photo.ts";
import { accessibleTaxonName } from "sharedHelpers/taxon.ts";
import { useCurrentUser, useFontScale, useTranslation } from "sharedHooks";

export interface Props {
  headerText?: string;
  showSpeciesSeenCheckmark?: boolean;
  style?: object;
  taxon: ApiTaxon;
  upperRight?: React.ReactNode;
}

const TaxonGridItem = ( {
  headerText,
  showSpeciesSeenCheckmark = false,
  style,
  taxon,
  upperRight
}: Props ) => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const accessibleName = accessibleTaxonName( taxon, currentUser, t );
  const { isLargeFontScale } = useFontScale();
  const route = useRoute( );

  const source = {
    uri: Photo.displayLocalOrRemoteMediumPhoto(
      taxon?.default_photo
    )
  };

  const obsPhotosCount = taxon?.default_photo
    ? 1
    : 0;

  return (
    <Pressable
      accessibilityRole="button"
      testID={`TaxonGridItem.Pressable.${taxon.id}`}
      onPress={( ) => (
        // Again, not sure how to placate TypeScript w/ React Navigation
        navigation.navigate( {
          // Ensure button mashing doesn't open multiple TaxonDetails instances
          key: `${route.key}-TaxonGridItem-TaxonDetails-${taxon.id}`,
          name: "TaxonDetails",
          params: { id: taxon.id }
        } )
      )}
      accessibilityLabel={accessibleName}
    >
      <ObsImagePreview
        source={source}
        style={style}
        isMultiplePhotosTop
        obsPhotosCount={obsPhotosCount}
        testID={`TaxonGridItem.${taxon.id}`}
        iconicTaxonName={taxon.iconic_taxon_name}
      >
        {showSpeciesSeenCheckmark && (
          <View className="absolute top-3 left-3">
            <SpeciesSeenCheckmark />
          </View>
        )}

        { upperRight && (
          <View className="absolute top-3 right-3">
            {upperRight}
          </View>
        ) }

        <View className="absolute bottom-0 flex p-2 w-full">
          { headerText && (
            <Body4
              maxFontSizeMultiplier={1.5}
              className="text-white py-1"
            >
              {headerText}
            </Body4>
          ) }
          <DisplayTaxonName
            keyBase={`TaxonGridItem-DisplayTaxonName-${taxon?.id}`}
            taxon={taxon}
            scientificNameFirst={currentUser?.prefers_scientific_name_first}
            prefersCommonNames={currentUser?.prefers_common_names}
            layout="vertical"
            color="text-white"
            showOneNameOnly={isLargeFontScale}
          />
        </View>
      </ObsImagePreview>
    </Pressable>
  );
};

export default TaxonGridItem;
