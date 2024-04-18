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
import { getShadowStyle } from "styles/global";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

type Props = {
  takePhoto: any,
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
            style={getShadow( theme.colors.primary )}
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
