import classnames from "classnames";
import {
  INatIcon
} from "components/SharedComponents";
import {
  Pressable, View
} from "components/styledComponents";
import React from "react";
import { useTheme } from "react-native-paper";
import { useTranslation } from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

const DROP_SHADOW = getShadowForColor( colors.black, { offsetHeight: 4 } );

interface Props {
  takePhoto: () => Promise<void>;
  disabled: boolean;
  showPrediction?: boolean;
}

const TakePhoto = ( {
  takePhoto,
  disabled,
  showPrediction
}: Props ) => {
  const { t } = useTranslation( );
  const theme = useTheme( );

  const borderClass = "border-[2px] rounded-full h-[64px] w-[64px]";

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
      style={DROP_SHADOW}
    >
      {showPrediction
        ? (
          <View
            className={classnames(
              borderClass,
              "bg-inatGreen items-center justify-center border-accessibleGreen"
            )}
          >
            <INatIcon
              name="sparkly-label"
              size={32}
              color={theme.colors.onPrimary}
            />
          </View>
        )
        : <View className={borderClass} />}
    </Pressable>
  );
};

export default TakePhoto;
