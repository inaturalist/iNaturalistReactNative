// @flow

import { Body3, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import Svg, { Path } from "react-native-svg";
import { dropShadow } from "styles/global";

type Props = {
  count: number,
  size?: number,
  shadow?: boolean
};

const PhotoCount = ( {
  count,
  size,
  shadow
}: Props ): Node => {
  const theme = useTheme( );

  if ( count === 0 ) {
    return <INatIcon name="noevidence" size={size} color={theme.colors.inverseOnSurface} />;
  }

  let photoCount = count;
  if ( count > 99 ) {
    photoCount = 99;
  }

  let paddingHorizontal = size === 50
    ? 12.5
    : 5;

  if ( photoCount > 9 ) {
    paddingHorizontal = 2;
  }

  const textStyle = {
    position: "absolute",
    zIndex: 10,
    paddingHorizontal,
    top: size === 50
      ? 22
      : 6
  };

  return (
    <View
      style={[{ height: size, width: size }, shadow && dropShadow]}
      testID="photo-count"
    >
      <Body3 style={textStyle}>
        {photoCount}
      </Body3>
      <Svg
        height={size}
        width={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Path
          fillRule="nonzero"
          clipRule="evenodd"
          d="M4 5.818a4 4 0 00-4 4V20a4 4 0 004 4h10.182a4 4 0 004-4V9.818a4 4 0 00-4-4z"
          fill={theme.colors.background}
        />
        <Path
        // eslint-disable-next-line max-len
          d="M15.364 3.636h-9.53A4 4 0 019.818 0H20a4 4 0 014 4v10.182a4 4 0 01-3.636 3.984v-9.53a5 5 0 00-5-5z"
          fill={theme.colors.background}
          clipRule="evenodd"
          fillRule="nonzero"
        />
      </Svg>
    </View>
  );
};

export default PhotoCount;

PhotoCount.defaultProps = {
  size: 24,
  shadow: false
};
