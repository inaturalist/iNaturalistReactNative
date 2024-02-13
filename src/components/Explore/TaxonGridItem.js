// @flow

import { useNavigation } from "@react-navigation/native";
import { DisplayTaxonName } from "components/SharedComponents";
import ObsImagePreview from "components/SharedComponents/ObservationsFlashList/ObsImagePreview";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import Photo from "realmModels/Photo";

import SpeciesSeenCheckmark from "./SpeciesSeenCheckmark";

type Props = {
  taxon: Object,
  width?: string,
  height?: string,
  style?: Object
};

const ObsGridItem = ( {
  taxon,
  width = "w-full",
  height,
  style
}: Props ): Node => {
  const navigation = useNavigation( );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => navigation.navigate( "TaxonDetails", { id: taxon.id } )}
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
        <SpeciesSeenCheckmark
          taxonId={taxon.id}
        />
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

export default ObsGridItem;
