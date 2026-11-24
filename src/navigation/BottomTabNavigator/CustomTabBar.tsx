import classNames from "classnames";
import AddObsButton from "components/AddObsBottomSheet/AddObsButton";
import { View } from "components/styledComponents";
import type { ComponentProps } from "react";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getShadow } from "styles/global";

import NavButton from "./NavButton";

const DROP_SHADOW = getShadow( {
  offsetHeight: -2,
  elevation: 20,
} );

interface Props {
  // Every tab is spread into NavButton, so a tab is exactly NavButton's props
  tabs: ComponentProps<typeof NavButton>[];
}


const CustomTabBar = ( { tabs }: Props ) => {
  const tabList: React.ReactNode[] = tabs.map(
    tab => <NavButton {...tab} key={tab.testID} />,
  );
  tabList.splice(
    -2,
    0,
    // Absolutely position the AddObsButton so it can float outside of the tab
    // bar
    (
      <View className="w-[69px] h-[60px]" key="CustomTabBar-AddObs">
        <View className="absolute top-[-13px]">
          <AddObsButton key="AddObsButton" />
        </View>
      </View>
    ),
  );

  const insets = useSafeAreaInsets( );

  return (
    <View
      className={classNames(
        "flex-row bg-white justify-around p-1 m-0",
      )}
      style={[DROP_SHADOW, { paddingBottom: insets.bottom }]}
      accessibilityRole="tablist"
      testID="CustomTabBar"
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
