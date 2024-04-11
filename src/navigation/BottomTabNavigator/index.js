import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Mortal from "components/SharedComponents/Mortal";
import {
  hideHeader,
  showHeader
} from "navigation/navigationOptions";
import TabStackNavigator from "navigation/StackNavigators/TabStackNavigator";
import React from "react";

import CustomTabBarContainer from "./CustomTabBarContainer";

const Tab = createBottomTabNavigator( );

const OBS_LIST_SCREEN_ID = "TabStackNavigator";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const renderTabBar = props => <CustomTabBarContainer {...props} />;

  // DEVELOPERS: do you need to add any screens here? All the rest of our screens live in
  // the NoBottomTabStackNavigator or TabStackNavigator

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName={OBS_LIST_SCREEN_ID}
        tabBar={renderTabBar}
        backBehavior="history"
        screenOptions={showHeader}
      >
        <Tab.Screen
          name="TabStackNavigator"
          component={TabStackNavigator}
          options={hideHeader}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
