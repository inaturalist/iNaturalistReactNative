// @flow

import classnames from "classnames";
import { Body3, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { I18nManager, PixelRatio } from "react-native";
import { useTheme } from "react-native-paper";
import Svg, { Path } from "react-native-svg";
import { useTranslation } from "sharedHooks";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

type Props = {
  count: number
};

const PhotoCount = ( { count }: Props ): Node => {
  const { t } = useTranslation( );
  const { isRTL } = I18nManager;
  const theme = useTheme( );
  const HEIGHT = PixelRatio.getFontScale() * 24;

  if ( count === 0 ) {
    return <INatIcon name="noevidence" size={HEIGHT} color={theme.colors.inverseOnSurface} />;
  }

  let photoCount = count;
  if ( count > 99 ) {
    photoCount = 99;
  }

  return (
    <View
      style={dropShadow}
      testID="photo-count"
    >
      <Body3
        maxFontSizeMultiplier={1}
        className={classnames(
          "absolute z-10",
          "left-1.5 top-1.5",
          {
            "left-0.5": photoCount > 9,
            "right-1.5": isRTL && photoCount < 9,
            "right-0.5": photoCount > 9 && isRTL
          }
        )}
      >
        {t( "Intl-number", { val: photoCount } )}
      </Body3>
      <Svg
        height={HEIGHT}
        width={HEIGHT}
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
        // eslint-disable-next-line max-len
          d="M15.364 3.636h-9.53A4 4 0 019.818 0H20a4 4 0 014 4v10.182a4 4 0 01-3.636 3.984v-9.53a5 5 0 00-5-5z"
          fill={colors.white}
          clipRule="evenodd"
          fillRule="nonzero"
        />
      </Svg>
    </View>
  );
};

export default PhotoCount;
