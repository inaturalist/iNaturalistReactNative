import classNames from "classnames";
import { IconicTaxonIcon } from "components/SharedComponents";
import { FasterImageView, View } from "components/styledComponents";
import React from "react";

interface Props {
  iconicTaxonIconSize?: number;
  iconicTaxonName?: string;
  imageClassName?: string;
  isBackground?: boolean;
  opaque?: boolean;
  uri?: {
    uri: string;
  };
  white?: boolean;
}

const CLASS_NAMES = [
  "grow",
  "aspect-square",
] as const;

const ObsImage = ( {
  iconicTaxonName,
  imageClassName,
  isBackground = false,
  opaque = false,
  uri,
  white = false,
  iconicTaxonIconSize,
}: Props ) => (
  <View className={classNames( CLASS_NAMES, "relative" )}>
    <View className="absolute w-full h-full">
      <IconicTaxonIcon
        imageClassName={[
          ...CLASS_NAMES,
          imageClassName,
          {
            "bg-darkGray": white && isBackground,
            "bg-transparent": white && !isBackground,
          },
          "border-0",
        ]}
        iconicTaxonName={iconicTaxonName}
        white={white}
        isBackground={isBackground}
        size={iconicTaxonIconSize}
      />
    </View>
    { uri?.uri && (
      <FasterImageView
        className={classNames( CLASS_NAMES )}
        testID="ObsList.photo"
        accessibilityIgnoresInvertColors
        fadeDuration={0}
        source={{
          url: uri.uri,
          cachePolicy: "discWithCacheControl",
          resizeMode: "cover",
        }}
      />
    ) }
    { opaque && (
      <View className="absolute w-full h-full bg-white opacity-50" />
    ) }
  </View>
);

export default ObsImage;
