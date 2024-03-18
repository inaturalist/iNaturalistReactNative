import classNames from "classnames";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import { getShadowStyle } from "styles/global";

const getShadow = (shadowColor: string) => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

interface Props {
  number: number;
  light?: boolean;
}

const NumberBadge = ( { number, light }: Props ): Node => {
  const theme = useTheme();
  return (
    <View
      className={classNames(
        "w-5 h-5 justify-center items-center rounded-full",
        light ? "bg-white" : "bg-inatGreen"
      )}
      style={getShadow( theme.colors.primary )}
    >
      <Body3 className={light ? "text-darkGray" : "text-white"}>{number}</Body3>
    </View>
  );
};

export default NumberBadge;
