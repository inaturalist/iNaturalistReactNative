import classnames from "classnames";
import { Body3, INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { I18nManager, PixelRatio } from "react-native";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { dropShadow } from "styles/global";
import colors from "styles/tailwindColors";

const BASE_DIM = 24;

interface Props {
  count: number;
}

const PhotoCount = ( { count }: Props ) => {
  const { t } = useTranslation( );
  const { isRTL } = I18nManager;
  const theme = useTheme( );
  const fontScale = PixelRatio.getFontScale();
  const dim = fontScale * BASE_DIM;
  const maxFontScale = Math.ceil( fontScale );
  if ( count === 0 ) {
    return <INatIcon name="noevidence" size={dim} color={theme.colors.inverseOnSurface} />;
  }

  let photoCount = count;
  if ( count > 99 ) {
    photoCount = 99;
  }

  const rectSize = dim * 0.758;
  const radius = dim * 0.167;
  const containerStyle = [dropShadow, { width: dim, height: dim }];
  const backRectStyle = {
    position: "absolute" as const,
    top: 0,
    right: 0,
    width: rectSize,
    height: rectSize,
    borderRadius: radius,
    backgroundColor: colors.white,
  };
  const frontRectStyle = {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    width: rectSize,
    height: rectSize,
    borderRadius: radius,
    backgroundColor: colors.white,
  };

  return (
    <View
      style={containerStyle}
      testID="photo-count"
    >
      <View style={backRectStyle} />
      <View style={frontRectStyle} />
      <Body3
        className={classnames(
          "absolute z-10",
          "bottom-0",
          isRTL
            ? "right-0"
            : "left-0",
          "text-center",
        )}
        style={{
          width: dim * 0.74,
          height: dim * 0.74,
        }}
        maxFontSizeMultiplier={maxFontScale}
      >
        {t( "Intl-number", { val: photoCount } )}
      </Body3>
    </View>
  );
};

export default PhotoCount;
