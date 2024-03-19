import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import About from "components/About";
import Donate from "components/Donate/Donate";
import FullPageWebView from "components/FullPageWebView/FullPageWebView";
import Help from "components/Help/Help";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import { Heading4 } from "components/SharedComponents";
import Mortal from "components/SharedComponents/Mortal";
import { t } from "i18next";
import {
  hideHeader,
  showHeader
} from "navigation/navigationOptions";
import DeveloperStackNavigator from "navigation/StackNavigators/DeveloperStackNavigator";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import React from "react";

import CustomTabBarContainer from "./CustomTabBarContainer";

const Tab = createBottomTabNavigator( );

const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const renderTabBar = props => <CustomTabBarContainer {...props} />;

  const aboutTitle = () => <Heading4>{t( "ABOUT-INATURALIST" )}</Heading4>;
  const donateTitle = () => <Heading4>{t( "DONATE" )}</Heading4>;
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
          name="FullPageWebView"
          component={FullPageWebView}
          options={{ headerTitle: "" }}
        />
        <Tab.Screen
          name="About"
          component={About}
          options={{
            ...showHeader,
            headerTitle: aboutTitle,
            headerTitleAlign: "center"
          }}
        />
        <Tab.Screen
          name="Donate"
          component={Donate}
          options={{
            ...showHeader,
            headerTitle: donateTitle,
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
        <Tab.Screen name="help" component={PlaceholderComponent} />
        <Tab.Screen name="Blog" component={PlaceholderComponent} />
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
