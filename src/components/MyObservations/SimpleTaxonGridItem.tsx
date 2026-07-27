import classNames from "classnames";
import { Body4, DisplayTaxonName } from "components/SharedComponents";
import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import {
  Image, LinearGradient, Pressable, View,
} from "components/styledComponents";
import React from "react";
import { useFeatureFlag, useTranslation } from "sharedHooks";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import colors from "styles/tailwindColors";
import type { SpeciesCount } from "types/sorting";

const imageClassNames = [
  "max-h-[210px]",
  "overflow-hidden",
  "relative",
  "w-[62px]",
  "h-[62px]",
  "rounded-2xl",
];

interface Props {
  accessibleName: string;
  navToTaxonDetails: ( ) => void;
  searchThisTaxon: ( ) => void;
  source: {
    uri: string;
  };
  style?: object;
  speciesCount: SpeciesCount;
}

const SimpleTaxonGridItem = ( {
  accessibleName,
  navToTaxonDetails,
  searchThisTaxon,
  source,
  style,
  speciesCount,
}: Props ) => {
  const { t } = useTranslation();
  const { count } = speciesCount;
  const searchMyObservationsEnabled = useFeatureFlag( FeatureFlag.SearchMyObservationsEnabled );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={searchMyObservationsEnabled
        ? searchThisTaxon
        : navToTaxonDetails}
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
      { searchMyObservationsEnabled && (
        <View className="absolute top-0 right-0">
          <INatIconButton
            icon="info-circle-outline"
            size={19}
            color={colors.white}
            onPress={navToTaxonDetails}
            accessibilityLabel={accessibleName}
            accessibilityHint={t( "Navigates-to-taxon-details" )}
            testID="SimpleTaxonGridItem.infoButton"
          />
        </View>
      ) }
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
