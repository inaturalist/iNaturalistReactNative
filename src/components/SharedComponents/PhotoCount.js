// @flow

import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { viewStyles } from "styles/sharedComponents/photoCount";
import colors from "styles/tailwindColors";

type Props = {
  count: number,
  size?: number,
  shadow?: boolean,
};

const PhotoCount = ( { count, size, shadow }: Props ): React.Node => {
  if ( count === 0 ) {
    return null;
  }

  let photoCount = count;
  if ( count > 99 ) {
    photoCount = 99;
  }

  return (
    <View
      style={[{ height: size, width: size }, shadow && viewStyles.shadow]}
      testID="photo-count"
    >
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
          fill={colors.white}
        />
        <Path
          // eslint-disable-next-line
          d="M15.364 3.636h-9.53A4 4 0 019.818 0H20a4 4 0 014 4v10.182a4 4 0 01-3.636 3.984v-9.53a5 5 0 00-5-5z"
          fill={colors.white}
          clipRule="evenodd"
          fillRule="nonzero"
        />
        <Body3>
          {photoCount}
        </Body3>
      </Svg>
    </View>
  );
};

export default PhotoCount;

PhotoCount.defaultProps = {
  size: 24,
  shadow: false
};
