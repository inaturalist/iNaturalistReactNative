// @flow
import classNames from "classnames";
import { IconicTaxonIcon } from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type URI = {
  uri: string,
};

type Props = {
  iconicTaxonIconSize?: number,
  iconicTaxonName?: string,
  imageClassName?: string,
  isBackground?: boolean,
  opaque?: boolean,
  uri?: URI,
  white?: boolean
};

const CLASS_NAMES = [
  "grow",
  "aspect-square"
];

const ObsImage = ( {
  iconicTaxonName,
  imageClassName,
  isBackground = false,
  opaque = false,
  uri,
  white = false,
  iconicTaxonIconSize
}: Props ): Node => (
  <View className={classNames( CLASS_NAMES, "relative" )}>
    <View className="absolute w-full h-full">
      <IconicTaxonIcon
        imageClassName={[
          ...CLASS_NAMES,
          imageClassName,
          {
            "bg-darkGray": white && isBackground,
            "bg-transparent": white && !isBackground
          },
          "border-0"
        ]}
        iconicTaxonName={iconicTaxonName}
        white={white}
        isBackground={isBackground}
        size={iconicTaxonIconSize}
      />
    </View>
    { uri?.uri && (
      <Image
        source={uri}
        className={classNames( CLASS_NAMES )}
        testID="ObsList.photo"
        accessibilityIgnoresInvertColors
        fadeDuration={0}
      />
    ) }
    { opaque && (
      <View className="absolute w-full h-full bg-white opacity-50" />
    ) }
  </View>
);

export default ObsImage;
