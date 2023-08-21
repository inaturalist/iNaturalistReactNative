import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import About from "components/About";
import ExploreContainer from "components/Explore/ExploreContainer";
import Identify from "components/Identify/Identify";
import Messages from "components/Messages/Messages";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import ProjectDetails from "components/Projects/ProjectDetails";
import Projects from "components/Projects/Projects";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import UiLibrary from "components/UiLibrary";
import { t } from "i18next";
import {
  hideHeader,
  hideHeaderLeft,
  showHeaderLeft
} from "navigation/navigationOptions";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import React from "react";
import User from "realmModels/User";
import useUserMe from "sharedHooks/useUserMe";

import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator();

const OBS_LIST_SCREEN_ID = "ObsList";
const EXPLORE_SCREEN_ID = "Explore";
const MESSAGES_SCREEN_ID = "Messages";

/* eslint-disable react/jsx-props-no-spreading */

const BottomTabs = ( ) => {
  const { remoteUser: user } = useUserMe( );

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
          name="ObservationNavigator"
          component={ObservationsStackNavigator}
          options={{
            ...hideHeader,
            meta: {
              icon: "person",
              userIconUri: User.uri( user ),
              testID: OBS_LIST_SCREEN_ID,
              accessibilityLabel: t( "Observations" ),
              accessibilityHint: t( "Navigates-to-observations" ),
              size: 40
            }
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreContainer}
          options={{
            ...hideHeader,
            meta: {
              icon: "compass-rose-outline",
              testID: EXPLORE_SCREEN_ID,
              accessibilityLabel: t( "Explore" ),
              accessibilityHint: t( "Navigates-to-explore" ),
              size: 40
            }
          }}
        />

        <Tab.Screen
          name="Messages"
          component={Messages}
          options={{
            ...hideHeaderLeft,
            meta: {
              icon: "notifications-bell",
              testID: MESSAGES_SCREEN_ID,
              accessibilityLabel: t( "Messages" ),
              accessibilityHint: t( "Navigates-to-messages" ),
              size: 32
            }
          }}
        />
        <Tab.Screen
          name="search"
          component={Search}
          options={{
            ...hideHeaderLeft,
            headerTitle: t( "Search" )
          }}
        />
        <Tab.Screen
          name="Identify"
          component={Identify}
          options={{ headerTitle: t( "Identify" ) }}
        />
        <Tab.Screen
          name="Projects"
          component={Projects}
          options={{ headerTitle: t( "Projects" ) }}
        />
        <Tab.Screen
          name="ProjectDetails"
          component={ProjectDetails}
          options={{ headerTitle: t( "Project" ) }}
        />
        <Tab.Screen
          name="settings"
          component={Settings}
          options={{ ...hideHeaderLeft, headerTitle: t( "Settings" ) }}
        />
        <Tab.Screen
          name="about"
          component={About}
          options={{ ...hideHeaderLeft, headerTitle: t( "About-iNaturalist" ) }}
        />
        <Tab.Screen
          name="help"
          component={PlaceholderComponent}
          options={hideHeaderLeft}
        />
        <Tab.Screen
          name="network"
          component={NetworkLogging}
          options={hideHeaderLeft}
        />
        <Tab.Screen
          name="UI Library"
          component={UiLibrary}
          options={{
            ...hideHeaderLeft
          }}
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
