import type { ArgumentArray } from "classnames";
import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

interface Props {
  iconicTaxonName?: string;
  imageClassName?: ArgumentArray;
  isBackground?: boolean;
  size?: number;
  white?: boolean;
}

const IconicTaxonIcon = ( {
  iconicTaxonName,
  imageClassName,
  isBackground = false,
  size = 30,
  white = false
}: Props ) => {
  let color;
  if ( white ) {
    color = isBackground
      ? colors.mediumGrayGhost
      : colors.white;
  }
  return (
    <View
      className={classnames(
        "shrink",
        "justify-center",
        "items-center",
        { "rounded-xl": !isBackground },
        { "border-[2px]": !isBackground },
        { "border-lightGray": !isBackground },
        {
          "border-white": white && !isBackground
        },
        imageClassName
      )}
      testID="IconicTaxonName.iconicTaxonIcon"
    >
      <INatIcon
        name={iconicTaxonName
          ? `iconic-${iconicTaxonName?.toLowerCase( )}`
          : "iconic-unknown"}
        size={size}
        color={color}
      />
    </View>
  );
};

export default IconicTaxonIcon;
