import classnames from "classnames";
import {
  BackButton
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React from "react";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  invertToWhiteBackground: boolean;
  headerRight?: React.JSX.Element;
  testID: string;
}

const OverlayHeader = ( {
  children,
  invertToWhiteBackground,
  headerRight,
  testID
}: Props ) => (
  <View className={
    classnames(
      "w-full justify-between items-center flex-row px-[13px] h-[44px]",
      {
        "bg-white": invertToWhiteBackground
      }
    )
  }
  >
    <View className="py-[21px]">
      <BackButton
        color={String(
          invertToWhiteBackground
            ? colors?.darkGray
            : colors?.white
        )}
        inCustomHeader
        testID={testID}
      />
    </View>
    {children && (
      <View className="shrink items-center justify-center">
        {children}
      </View>
    )}
    {/*
      Even if there's no headerRight, we want a spacer here so the center
      element remains centered in the header.
    */}
    <View className="py-[7px] min-w-[42px] justify-center">
      {headerRight}
    </View>
  </View>
);

export default OverlayHeader;
