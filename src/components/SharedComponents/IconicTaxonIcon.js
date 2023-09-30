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
  style?: Object,
  white?: boolean
}

const IconicTaxonIcon = ( {
  iconicTaxonName = "unknown",
  imageClassName,
  style = {},
  white = false
}: Props ): Node => (
  <View
    className={classnames(
      imageClassName,
      "justify-center items-center",
      {
        "bg-darkGray": white,
        "border border-lightGray": !white
      }
    )}
    testID="IconicTaxonName.iconicTaxonIcon"
    style={style}
  >
    <INatIcon
      name={iconicTaxonName && `iconic-${iconicTaxonName?.toLowerCase( )}`}
      size={style?.width > 80
        ? 30
        : 22}
      color={white && colors.white}
    />
  </View>
);

export default IconicTaxonIcon;
