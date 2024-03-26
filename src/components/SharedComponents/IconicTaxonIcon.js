// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

type Props = {
  iconicTaxonName: string,
  imageClassName?: string,
  isBackground?: boolean,
  size?: number,
  white?: boolean
}

const IconicTaxonIcon = ( {
  iconicTaxonName = "unknown",
  imageClassName,
  isBackground = false,
  size = 30,
  white = false
}: Props ): Node => {
  let color = null;
  if ( white ) {
    color = isBackground
      ? colors.mediumGrayGhost
      : colors.white;
  }
  return (
    <View
      className={classnames(
        imageClassName,
        "shrink justify-center items-center",
        {
          "bg-darkGray": white,
          "border border-lightGray": !white
        }
      )}
      testID="IconicTaxonName.iconicTaxonIcon"
    >
      <INatIcon
        name={iconicTaxonName && `iconic-${iconicTaxonName?.toLowerCase( )}`}
        size={size}
        color={color}
      />
    </View>
  );
};

export default IconicTaxonIcon;
