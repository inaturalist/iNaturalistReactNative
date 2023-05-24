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
  closeButtonIcon?: string
}

const Header = ( { headerText, closeButtonIcon }: Props ): Node => (
  <View>
    <View className={classnames( "self-end pr-2", {
      "self-start": closeButtonIcon
    } )}
    >
      <CloseButton size={19} icon={closeButtonIcon} />
    </View>
    <View className="self-center">
      <Image
        className="w-[234px] h-[43px]"
        resizeMode="contain"
        source={require( "images/inaturalist.png" )}
        accessibilityIgnoresInvertColors
      />
      {headerText && (
        <Body1 className="text-center color-white mt-[24px] max-w-[280px]">
          {headerText}
        </Body1>
      )}
    </View>
  </View>
);

export default Header;
