import classnames from "classnames";
import {
  BackButton
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
import React, { PropsWithChildren } from "react";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  invertToWhiteBackground: boolean
  rightHeaderButton?: React.JSX.Element;
  testID: string,
}

const OverlayHeader = ( {
  children,
  invertToWhiteBackground,
  rightHeaderButton,
  testID
}: Props ) => (
  <View className={
    classnames(
      "w-full justify-between flex-row px-[13px]",
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
      <View className="grow items-center justify-center">
        {children}
      </View>
    )}
    <View className="py-[7px]">
      {rightHeaderButton}
    </View>
  </View>
);

export default OverlayHeader;
