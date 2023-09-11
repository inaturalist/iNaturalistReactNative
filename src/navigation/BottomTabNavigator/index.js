import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import About from "components/About";
import Messages from "components/Messages/Messages";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import UiLibrary from "components/UiLibrary";
import { t } from "i18next";
import {
  hideHeader,
  hideHeaderLeft,
  showHeader,
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
        <Tab.Screen
          name="search"
          component={Search}
          options={{
            ...showHeader,
            headerTitle: t( "Search" )
          }}
        />
        <Tab.Screen
          name="settings"
          component={Settings}
          options={{ headerTitle: t( "Settings" ) }}
        />
        <Tab.Screen
          name="about"
          component={About}
          options={{ headerTitle: t( "About-iNaturalist" ) }}
        />
        <Tab.Screen
          name="help"
          component={PlaceholderComponent}
        />
        <Tab.Screen
          name="network"
          component={NetworkLogging}
        />
        <Tab.Screen
          name="UI Library"
          component={UiLibrary}
        />
        <Tab.Screen
          name="Help"
          component={PlaceholderComponent}
        />
        <Tab.Screen
          name="Blog"
          component={PlaceholderComponent}
        />
        <Tab.Screen
          name="Donate"
          component={PlaceholderComponent}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
