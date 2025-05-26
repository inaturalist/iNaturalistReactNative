// @flow
import classNames from "classnames";
import AddObsButton from "components/AddObsModal/AddObsButton";
import { Body2 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Tooltip from "react-native-walkthrough-tooltip";
import { getShadow } from "styles/global";

import NavButton from "./NavButton";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2,
  elevation: 20
} );

type Props = {
  tabs: Array<Object>,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { tabs }: Props ): Node => {
  const tabList = tabs.map( tab => <NavButton {...tab} key={tab.testID} /> );
  const contentStyle = {
    height: 50,
    paddingVertical: 16,
    borderRadius: 16
  };
  tabList.splice(
    -2,
    0,
    // Absolutely position the AddObsButton so it can float outside of the tab
    // bar
    (
      <View className="w-[69px] h-[60px] mx-3" key="CustomTabBar-AddObs">
        <View className="absolute top-[-13px]">
          <Tooltip
            isVisible
            content={(
              <Body2>
                {t( "Press-and-hold-to-view-more-options" )}
              </Body2>
            )}
            contentStyle={contentStyle}
            placement="top"
            arrowSize={{ width: 21, height: 16 }}
            backgroundColor="rgba(0,0,0,0.7)"
            disableShadow
          >
            <AddObsButton key="AddObsButton" />
          </Tooltip>
        </View>
      </View>
    )
  );

  const insets = useSafeAreaInsets( );

  return (
    <View
      className={classNames(
        "flex-row bg-white justify-evenly p-1 m-0",
        { "pb-5": insets.bottom > 0 }
      )}
      style={DROP_SHADOW}
      accessibilityRole="tablist"
      testID="CustomTabBar"
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
