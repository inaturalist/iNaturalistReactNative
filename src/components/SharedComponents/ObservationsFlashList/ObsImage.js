// @flow
import classNames from "classnames";
import { IconicTaxonIcon } from "components/SharedComponents";
import { Image } from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type URI = {
  uri: string,
};

type Props = {
  iconicTaxonIconSize?: number,
  iconicTaxonName?: string,
  imageClassName: string,
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
  iconicTaxonName = "unknown",
  imageClassName,
  isBackground = false,
  opaque = false,
  uri,
  white = false,
  iconicTaxonIconSize
}: Props ): Node => {
  const noImg = !uri?.uri;

  if ( noImg ) {
    return (
      <IconicTaxonIcon
        imageClassName={[
          ...CLASS_NAMES,
          imageClassName,
          { "bg-darkGray": white }
        ]}
        iconicTaxonName={iconicTaxonName}
        white={white}
        isBackground={isBackground}
        size={iconicTaxonIconSize}
      />
    );
  }

  return (
    <Image
      source={uri}
      className={classNames( ...CLASS_NAMES, { "opacity-50": opaque } )}
      testID="ObsList.photo"
      accessibilityIgnoresInvertColors
    />
  );
};

export default ObsImage;
