// @flow

import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import INaturalistLogo from "images/svg/inaturalist-white.svg";
import type { Node } from "react";
import React from "react";

type Props = {
  headerText?: string,
  hideHeader?: boolean
}

const Header = ( { headerText, hideHeader }: Props ): Node => {
  if ( hideHeader ) { return null; }

  const renderLogo = ( ) => (
    // $FlowIgnore[not-a-component]
    <INaturalistLogo width="234" height="43" />
  );
  return (
    <View className="items-center mx-[55px]">
      {renderLogo()}
      {headerText && (
        <Body1 className="text-center color-white mt-[23px]">
          {headerText}
        </Body1>
      )}
    </View>
  );
};

export default Header;
