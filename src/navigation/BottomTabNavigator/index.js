import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Mortal from "components/SharedComponents/Mortal.tsx";
import TabStackNavigator, {
  SCREEN_NAME_NOTIFICATIONS,
  SCREEN_NAME_OBS_LIST,
  SCREEN_NAME_ROOT_EXPLORE
} from "navigation/StackNavigators/TabStackNavigator";
import React from "react";

import CustomTabBarContainer from "./CustomTabBarContainer";

const Tab = createBottomTabNavigator( );

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const renderTabBar = props => <CustomTabBarContainer {...props} />;

  // DEVELOPERS: do you need to add any screens here? All the rest of our screens live in
  // NoBottomTabStackNavigator, TabStackNavigator, or LoginStackNavigator

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName="ObservationsTab"
        tabBar={renderTabBar}
        backBehavior="history"
        screenOptions={{
          lazy: true,
          freezeOnBlur: true,
          headerShown: false
        }}
      >
        <Tab.Screen
          name="ObservationsTab"
          component={TabStackNavigator}
          initialParams={{ initialRouteName: SCREEN_NAME_OBS_LIST }}
        />
        <Tab.Screen
          name="ExploreTab"
          component={TabStackNavigator}
          initialParams={{ initialRouteName: SCREEN_NAME_ROOT_EXPLORE }}
        />
        <Tab.Screen
          name="NotificationsTab"
          component={TabStackNavigator}
          initialParams={{ initialRouteName: SCREEN_NAME_NOTIFICATIONS }}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
