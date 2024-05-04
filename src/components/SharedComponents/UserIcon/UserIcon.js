// @flow

import { FasterImageView } from "components/styledComponents";
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
      return 22;
    }
    if ( large ) {
      return 134;
    }
    if ( medium ) {
      return 62;
    }
    return 40;
  };

  const size = getSize( );

  // For unknown reasons, the green border doesn't show up on Android using nativewind classNames
  // but it works with style, might warrant further investigation or an issue in nativewind
  const style = {
    width: size,
    height: size,
    overflow: "hidden"
  };
  const activeStyle = {
    borderColor: colors.inatGreen,
    borderWidth: 3,
    borderRadius: size / 2
  };
  return (
    <FasterImageView
      testID="UserIcon.photo"
      style={[active && activeStyle, style]}
      source={{
        url: uri?.uri,
        borderRadius: size / 2,
        resizeMode: "cover"
      }}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors
    />

  );
};

export default UserIcon;
