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
  const backgroundColor = light ? "bg-white" : "bg-inatGreen";
  const textColor = light ? "text-darkGray" : "text-white";
  return (
    <View
      className={classNames(
        "w-[24px] h-[24px] justify-center items-center rounded-full",
        backgroundColor
      )}
      style={getShadow( theme.colors.primary )}
    >
      <Body3 className={textColor}>{number}</Body3>
    </View>
  );
};

export default NumberBadge;
