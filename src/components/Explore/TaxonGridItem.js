// @flow

import { useNavigation } from "@react-navigation/native";
import { DisplayTaxonName } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";
import { useTranslation } from "sharedHooks";

type Props = {
  taxon: Object,
  width?: string,
  height?: string,
  style?: Object
};

const TaxonGridItem = ( {
  taxon,
  width = "w-full",
  height,
  style
}: Props ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );

  return (
    <Pressable
      accessibilityRole="button"
      testID={`TaxonGridItem.Pressable.${taxon.id}`}
      onPress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
      accessibilityLabel={t( "Navigate-to-taxon-details" )}
    >
      <ObsImagePreview
        source={{
          uri: Photo.displayLocalOrRemoteMediumPhoto(
            taxon?.default_photo
          )
        }}
        width={width}
        height={height}
        style={style}
        isMultiplePhotosTop
        obsPhotosCount={taxon?.default_photo
          ? 1
          : 0}
        testID={`TaxonGridItem.${taxon.id}`}
        iconicTaxonName={taxon.iconic_taxon_name}
      >
        {taxon.rank_level <= 10 && (
          <View className="absolute top-3 left-3">
            <SpeciesSeenCheckmark taxonId={taxon.id} />
          </View>
        )}

        <View className="absolute bottom-0 flex p-2 w-full">
          <DisplayTaxonName
            keyBase={taxon?.id}
            taxon={taxon}
            layout="vertical"
            color="text-white"
          />
        </View>
      </ObsImagePreview>
    </Pressable>
  );
};

export default TaxonGridItem;
