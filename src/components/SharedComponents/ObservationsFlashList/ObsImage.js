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
  style?: Object,
  iconicTaxonName?: string,
  white?: boolean,
  imageClassName: string
};

const ObsImage = ( {
  uri,
  opaque = false,
  iconicTaxonName = "unknown",
  white = false,
  style,
  imageClassName
}: Props ): Node => {
  const noImg = !uri?.uri;

  if ( noImg ) {
    return (
      <IconicTaxonIcon
        imageClassName={imageClassName}
        iconicTaxonName={iconicTaxonName}
        style={style}
        white={white}
      />
    );
  }

  return (
    <Image
      source={uri}
      className={classNames( "grow aspect-square", { "opacity-50": opaque } )}
      testID="ObsList.photo"
      accessibilityIgnoresInvertColors
    />
  );
};

export default ObsImage;
