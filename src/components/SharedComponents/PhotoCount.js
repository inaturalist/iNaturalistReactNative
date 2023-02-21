// @flow

import { View } from "components/styledComponents";
import * as React from "react";
import Svg, { Path, Text } from "react-native-svg";

type Props = {
  count: number,
  size?: number,
  shadow: boolean,
};

const PhotoCount = ( { count, size, shadow }: Props ): React.Node => {
  if ( count <= 0 || count > 99 ) {
    return null;
  }

  return (
    <View
      className={`drop-shadow-md w-[${String( size )}px] h-[${String( size )}px] ${String(
        shadow && "shadow"
      )}`}
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
          fill="#fff"
          filter="url(#drop-shadow)"
        />
        <Path
          // eslint-disable-next-line
          d="M15.364 3.636h-9.53A4 4 0 019.818 0H20a4 4 0 014 4v10.182a4 4 0 01-3.636 3.984v-9.53a5 5 0 00-5-5z"
          fill="#fff"
          clipRule="evenodd"
          fillRule="nonzero"
          filter="url(#drop-shadow)"
        />
        <Text x="38%" y="77%" textAnchor="middle" fontSize="10" fill="gray">
          {count}
        </Text>
      </Svg>
    </View>
  );
};

export default PhotoCount;

PhotoCount.defaultProps = {
  size: 24
};
