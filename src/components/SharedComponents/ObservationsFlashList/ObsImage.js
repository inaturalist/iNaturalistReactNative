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
  uri?: URI,
  opaque?: boolean,
  iconicTaxonName?: string,
  white?: boolean,
  imageClassName: string
};

const CLASS_NAMES = [
  "grow",
  "aspect-square"
];

const ObsImage = ( {
  uri,
  opaque = false,
  iconicTaxonName = "unknown",
  white = false,
  imageClassName
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
