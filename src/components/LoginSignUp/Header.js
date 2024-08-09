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
    <View className="w-full items-center shrink">
      {renderLogo()}
      {headerText && (
        <Body1 className="text-center color-white mt-[24px] max-w-[280px]">
          {headerText}
        </Body1>
      )}
    </View>
  );
};

export default Header;
