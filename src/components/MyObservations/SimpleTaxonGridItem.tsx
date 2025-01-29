import type { ApiTaxon } from "api/types";
import classNames from "classnames";
import { DisplayTaxonName } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import React from "react";

const imageClassNames = [
  "max-h-[210px]",
  "overflow-hidden",
  "relative",
  "w-[62px]",
  "h-[62px]",
  "rounded-2xl"
];

export interface Props {
  accessibleName: string;
  navToTaxonDetails: ( ) => void;
  source: {
    uri: string
  };
  style?: Object;
  taxon: ApiTaxon;
}

const SimpleTaxonGridItem = ( {
  accessibleName,
  navToTaxonDetails,
  source,
  style,
  taxon
}: Props ) => (
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
      testID="ObsList.photo"
      accessibilityIgnoresInvertColors
      fadeDuration={0}
    />
    <View className="absolute bottom-0 flex p-2 w-full">
      <DisplayTaxonName
        keyBase={`TaxonGridItem-DisplayTaxonName-${taxon?.id}`}
        taxon={taxon}
        layout="vertical"
        color="text-white"
        showOneNameOnly
      />
    </View>
  </Pressable>
);

export default SimpleTaxonGridItem;
