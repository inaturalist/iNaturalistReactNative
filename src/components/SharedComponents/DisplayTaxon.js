// @flow

import classnames from "classnames";
import {
  DisplayTaxonName,
  IconicTaxonIcon
} from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { accessibleTaxonName } from "sharedHelpers/taxon.ts";
import { useCurrentUser, useTranslation } from "sharedHooks";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel?: string,
  bottomTextComponent?: Function,
  handlePress: Function,
  taxon: Object,
  testID?: string,
  topTextComponent?: Function,
  withdrawn?: boolean
}

const DisplayTaxon = ( {
  accessibilityHint,
  accessibilityLabel,
  bottomTextComponent,
  handlePress,
  taxon,
  testID,
  topTextComponent,
  withdrawn
}: Props ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );

  const imageClassName = "w-[62px] h-[62px] rounded-lg";

  const iconicTaxonName = taxon?.isIconic
    ? taxon.name
    : taxon?.iconic_taxon_name;

  const taxonPhoto = taxon?.default_photo?.url;
  const accessibleName = accessibleTaxonName( taxon, currentUser, t );

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center shrink"
      onPress={handlePress}
      testID={testID}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel || accessibleName}
    >
      <View className="justify-between flex-row items-center w-full">
        <View className="flex-row items-center">
          {taxonPhoto
            ? (
              <Image
                source={{ uri: taxonPhoto }}
                className={classnames(
                  imageClassName,
                  {
                    "opacity-50": withdrawn
                  }
                )}
                accessibilityIgnoresInvertColors
                testID="DisplayTaxon.image"
              />
            )
            : (
              <IconicTaxonIcon
                imageClassName={imageClassName}
                iconicTaxonName={iconicTaxonName}
              />
            )}
          <View className="ml-3 shrink">
            <DisplayTaxonName
              taxon={taxon}
              withdrawn={withdrawn}
              scientificNameFirst={currentUser?.prefers_scientific_name_first}
              prefersCommonNames={currentUser?.prefers_common_names}
              topTextComponent={topTextComponent}
              bottomTextComponent={bottomTextComponent}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default DisplayTaxon;
