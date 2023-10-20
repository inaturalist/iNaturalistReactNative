// @flow

import { Body1 } from "components/SharedComponents";
import {
  Image, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  headerText?: string,
  hideLogo?: boolean
}

const Header = ( { headerText, hideLogo }: Props ): Node => (
  <View className="shrink">
    <View className="w-full items-center">
      { !hideLogo && (
        <Image
          className="w-[234px] h-[43px]"
          resizeMode="contain"
          source={require( "images/inaturalist.png" )}
          accessibilityIgnoresInvertColors
        />
      ) }
      {headerText && (
        <Body1 className="text-center color-white mt-[24px] max-w-[280px]">
          {headerText}
        </Body1>
      )}
    </View>
  </View>
);

export default Header;
