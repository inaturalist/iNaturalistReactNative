// @flow

import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.darkGray );

type Props = {
  takePhoto: Function,
  disabled: boolean,
  showPrediction?: boolean
}

const TakePhoto = ( {
  takePhoto,
  disabled,
  showPrediction
}: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  const borderClass = "border-[1.64px] rounded-full h-[60px] w-[60px]";

  return (
    <Pressable
      className={classnames(
        "bg-white",
        "rounded-full",
        "h-[74px]",
        "w-[74px]",
        "justify-center",
        "items-center",
        {
          "opacity-50": disabled
        }
      )}
      onPress={takePhoto}
      accessibilityLabel={t( "Take-photo" )}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
    >
      {showPrediction
        ? (
          <View
            style={DROP_SHADOW}
            className={classnames(
              borderClass,
              "bg-inatGreen items-center justify-center border-darkGray"
            )}
          >
            <INatIcon
              name="sparkly-label"
              size={24}
              color={theme.colors.onPrimary}
            />
          </View>
        )
        : <View className={borderClass} />}
    </Pressable>
  );
};

export default TakePhoto;
