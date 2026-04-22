import classNames from "classnames";
import { Body3 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
  shadowRadius: 4,
} );

interface Props {
  number: number;
  light?: boolean;
}

const NumberBadge = ( { number, light }: Props ) => {
  const { t } = useTranslation();
  const backgroundColor = light
    ? "bg-white"
    : "bg-inatGreen";
  const textColor = light
    ? "text-darkGray"
    : "text-white";
  return (
    <View
      className={classNames(
        "w-[24px] h-[24px] justify-center items-center rounded-full",
        backgroundColor,
      )}
      style={DROP_SHADOW}
    >
      <Body3
        className={textColor}
        maxFontSizeMultiplier={1}
      >
        {t( "Intl-number", { val: number } )}
      </Body3>
    </View>
  );
};

export default NumberBadge;
