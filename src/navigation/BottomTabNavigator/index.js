// eslint-disable-next-line import/no-extraneous-dependencies
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Mortal from "components/SharedComponents/Mortal";
import {
  hideHeader,
  showHeader
} from "navigation/navigationOptions";
import TabStackNavigator from "navigation/StackNavigators/TabStackNavigator";
import React from "react";

import CustomTabBarContainer from "./CustomTabBarContainer";

const Tab = createMaterialTopTabNavigator( );

const OBS_LIST_SCREEN_ID = "TabStackNavigator";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const renderTabBar = props => <CustomTabBarContainer {...props} />;

  // DEVELOPERS: do you need to add any screens here? All the rest of our screens live in
  // NoBottomTabStackNavigator, TabStackNavigator, or LoginStackNavigator

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName={OBS_LIST_SCREEN_ID}
        tabBar={renderTabBar}
        backBehavior="order"
        screenOptions={{
          ...showHeader,
          swipeEnabled: false,
          animationEnabled: false
        }}
        tabBarPosition="bottom"
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
