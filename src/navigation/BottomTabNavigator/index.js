import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Messages from "components/Messages/Messages";
import Mortal from "components/SharedComponents/Mortal";
import {
  hideHeader,
  hideHeaderLeft,
  showHeaderLeft
} from "navigation/navigationOptions";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import React from "react";

import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator( );

const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const renderTabBar = props => <CustomTabBar {...props} />;

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName={OBS_LIST_SCREEN_ID}
        tabBar={renderTabBar}
        backBehavior="history"
        screenOptions={showHeaderLeft}
      >
        <Tab.Screen
          name="ObservationsStackNavigator"
          component={ObservationsStackNavigator}
          options={hideHeader}
        />
        <Tab.Screen
          name="Messages"
          component={Messages}
          options={hideHeaderLeft}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
