import type { ApiTaxon } from "api/types";
import classNames from "classnames";
import { DisplayTaxonName } from "components/SharedComponents";
import SpeciesSeenCheckmark from "components/SharedComponents/SpeciesSeenCheckmark";
import { Image, Pressable, View } from "components/styledComponents";
import React, { memo } from "react";

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

const SimpleTaxonGridItem = memo( ( {
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
      loading="eager"
      fadeDuration={0}
    />
    <View className="absolute top-3 left-3">
      <SpeciesSeenCheckmark />
    </View>
    <View className="absolute bottom-0 flex p-2 w-full">
      <DisplayTaxonName
        keyBase={`TaxonGridItem-DisplayTaxonName-${taxon?.id}`}
        taxon={taxon}
        layout="vertical"
        color="text-white"
        showOneNameOnly={false}
      />
    </View>
  </Pressable>
), ( prevProps, nextProps ) => prevProps.taxon.id === nextProps.taxon.id
  && prevProps.source.uri === nextProps.source.uri );

export default SimpleTaxonGridItem;
