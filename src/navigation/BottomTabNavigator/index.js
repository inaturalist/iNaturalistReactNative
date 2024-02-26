import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import About from "components/About";
import Help from "components/Help/Help";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import { Heading4 } from "components/SharedComponents";
import Mortal from "components/SharedComponents/Mortal";
import Support from "components/Support/Support";
import { t } from "i18next";
import {
  hideHeader,
  showHeader
} from "navigation/navigationOptions";
import DeveloperStackNavigator from "navigation/StackNavigators/DeveloperStackNavigator";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import ProjectsStackNavigator from "navigation/StackNavigators/ProjectsStackNavigator";
import React from "react";
import { useIsConnected } from "sharedHooks";

import CustomTabBarContainer from "./CustomTabBarContainer";

const Tab = createBottomTabNavigator( );

const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const isOnline = useIsConnected( );
  const renderTabBar = props => <CustomTabBarContainer {...props} isOnline={isOnline} />;

  const supportTitle = () => <Heading4>{t( "SUPPORT" )}</Heading4>;
  const helpTitle = () => <Heading4>{t( "HELP" )}</Heading4>;

  return (
    <Mortal>
      <Tab.Navigator
        initialRouteName={OBS_LIST_SCREEN_ID}
        tabBar={renderTabBar}
        backBehavior="history"
        screenOptions={showHeader}
      >
        <Tab.Screen
          name="ObservationsStackNavigator"
          component={ObservationsStackNavigator}
          options={hideHeader}
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
          name="Support"
          component={Support}
          options={{
            ...showHeader,
            headerTitle: supportTitle,
            headerTitleAlign: "center"
          }}
        />
        <Tab.Screen
          name="Help"
          component={Help}
          options={{
            ...showHeader,
            headerTitle: helpTitle,
            headerTitleAlign: "center"
          }}
        />
        <Tab.Screen
          name="about"
          component={About}
          options={{ headerTitle: t( "About-iNaturalist" ) }}
        />
        <Tab.Screen name="help" component={PlaceholderComponent} />
        <Tab.Screen name="Blog" component={PlaceholderComponent} />
        <Tab.Screen
          name="ProjectsStackNavigator"
          component={ProjectsStackNavigator}
          options={hideHeader}
        />
        <Tab.Screen
          name="DeveloperStackNavigator"
          component={DeveloperStackNavigator}
          options={hideHeader}
        />
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
