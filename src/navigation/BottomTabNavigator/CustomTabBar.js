// @flow
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

type Props = {
  tabs: Array<Object>,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { tabs }: Props ): Node => {
  const tabList = tabs.map( tab => <NavButton {...tab} key={tab.testID} /> );

  tabList.splice( -2, 0, <AddObsButton key="AddObsButton" /> );

  const insets = useSafeAreaInsets( );

  return (
    <View
      className={classNames(
        "flex-row bg-white justify-evenly items-center p-1 m-0",
        { "pb-5": insets.bottom > 0 }
      )}
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: -3,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 20
      } )}
      accessibilityRole="tablist"
      testID="CustomTabBar"
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
