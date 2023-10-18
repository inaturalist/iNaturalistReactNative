// @flow

import classnames from "classnames";
import {
  Body1, CloseButton
} from "components/SharedComponents";
import {
  Image, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";

type Props = {
  headerText?: string,
  hideLogo?: boolean,
  closeButtonIcon?: string
}

const Header = ( { headerText, hideLogo, closeButtonIcon }: Props ): Node => (
  <View className="shrink">
    <View className={classnames( "self-end pt-2 pr-2", {
      "self-start": closeButtonIcon
    } )}
    >
      <CloseButton size={19} icon={closeButtonIcon} />
    </View>
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
