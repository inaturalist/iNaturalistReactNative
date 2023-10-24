// @flow
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

type Props = {
  tabs: Array<Object>,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { tabs }: Props ): Node => {
  const tabList = tabs.map( tab => (
    <View key={tab.testID}>
      <NavButton {...tab} />
    </View>
  ) );

  tabList.splice( -2, 0, <AddObsButton key="AddObsButton" /> );

  return (
    <View
      className={classNames(
        "flex flex-row fixed bottom-0 bg-white w-full justify-evenly items-center p-1 m-0",
        { "pb-5": Platform.OS === "ios" }
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
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
