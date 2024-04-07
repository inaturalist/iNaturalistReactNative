// @flow

import classNames from "classnames";
import { FasterImageView as Image } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import colors from "styles/tailwindColors";

type Props = {
  uri: Object,
  small?: boolean,
  active?: boolean,
  large?: boolean,
  medium?: boolean
}

const UserIcon = ( {
  uri, small, active, large, medium
}: Props ): Node => {
  const getSize = ( ) => {
    if ( small ) {
      return "w-[22px] h-[22px]";
    }
    if ( large ) {
      return "w-[134px] h-[134px]";
    }
    if ( medium ) {
      return "w-[62px] h-[62px]";
    }
    return "w-[40px] h-[40px]";
  };

  const size = getSize( );
  const className = classNames(
    "rounded-full",
    size
  );

  // For unknown reasons, the green border doesn't show up on Android using nativewind classNames
  // but it works with style, might warrant further investigation or an issue in nativewind
  const style = { borderColor: colors.inatGreen, borderWidth: 3 };
  return (
    <Image
      testID="UserIcon.photo"
      className={className}
      style={active && style}
      source={uri}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />
  );
};

export default UserIcon;
