import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreContainer from "components/Explore/ExploreContainer";
import Messages from "components/Messages/Messages";
import Mortal from "components/SharedComponents/Mortal";
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

const Tab = createBottomTabNavigator( );

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
      </Tab.Navigator>
    </Mortal>
  );
};

export default BottomTabs;
