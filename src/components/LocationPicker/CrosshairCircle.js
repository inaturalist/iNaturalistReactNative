// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";

type Props = {
  accuracyTest: string,
  containerStyle: Object
};

const CrosshairCircle = ( { accuracyTest, containerStyle }: Props ): Node => {
  const theme = useTheme( );

  return (
    <View className="absolute" style={containerStyle}>
      <View
        className={
          classnames(
            "h-[254px] w-[254px] bg-transparent rounded-full border-[5px]",
            {
              "border-inatGreen": accuracyTest === "pass",
              "border-warningYellow border-dashed": accuracyTest === "acceptable",
              "border-warningRed": accuracyTest === "fail"
            }
          )
        }
      >
        {/* vertical crosshair */}
        <View className={classnames( "h-[244px] border border-darkGray absolute left-[122px]" )} />
        {/* horizontal crosshair */}
        <View className={classnames( "w-[244px] border border-darkGray absolute top-[122px]" )} />
      </View>
      <View className="absolute left-[234px]">
        {accuracyTest === "pass" && (
          <INatIcon
            name="checkmark-circle"
            size={19}
            color={theme.colors.secondary}
          />
        )}
        {accuracyTest === "fail" && (
          <INatIcon
            name="triangle-exclamation"
            size={19}
            color={theme.colors.error}
          />
        )}
      </View>
    </View>
  );
};

export default CrosshairCircle;
