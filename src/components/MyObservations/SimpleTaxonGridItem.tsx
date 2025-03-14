import classNames from "classnames";
import { Body4, DisplayTaxonName } from "components/SharedComponents";
import {
  Image, LinearGradient, Pressable, View
} from "components/styledComponents";
import React from "react";
import type { RealmTaxon } from "realmModels/types";
import { useTranslation } from "sharedHooks";

const imageClassNames = [
  "max-h-[210px]",
  "overflow-hidden",
  "relative",
  "w-[62px]",
  "h-[62px]",
  "rounded-2xl"
];

interface SpeciesCount {
  count: number,
  taxon: RealmTaxon
}

export interface Props {
  accessibleName: string;
  navToTaxonDetails: ( ) => void;
  source: {
    uri: string
  };
  style?: Object;
  speciesCount: SpeciesCount;
}

const SimpleTaxonGridItem = ( {
  accessibleName,
  navToTaxonDetails,
  source,
  style,
  speciesCount
}: Props ) => {
  const { t } = useTranslation();
  const { count } = speciesCount;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={navToTaxonDetails}
      accessibilityLabel={accessibleName}
      testID="SimpleTaxonGridItem"
      className={classNames( imageClassNames )}
      style={style}
    >
      <Image
        source={source}
        className="grow aspect-square"
        testID="TaxonGridItem.photo"
        accessibilityIgnoresInvertColors
        fadeDuration={0}
      />
      <LinearGradient
        colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6) 100%)"]}
        className="absolute w-full h-full"
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0, y: 1 }}
      />
      <View className="absolute bottom-0 flex p-2 w-full">
        <Body4
          maxFontSizeMultiplier={1.5}
          className="text-white py-1"
        >
          {t( "X-Observations", { count } )}
        </Body4>
        <DisplayTaxonName
          keyBase={`TaxonGridItem-DisplayTaxonName-${speciesCount?.taxon?.id}`}
          taxon={speciesCount?.taxon}
          layout="vertical"
          color="text-white"
          showOneNameOnly
        />
      </View>
    </Pressable>
  );
};

export default SimpleTaxonGridItem;
