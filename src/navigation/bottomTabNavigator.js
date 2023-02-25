import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import classNames from "classnames";
import Explore from "components/Explore/Explore";
import Messages from "components/Messages/Messages";
import ObsList from "components/Observations/ObsList";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import NavButton from "components/SharedComponents/NavBar/NavButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import React from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import getShadowStyle from "sharedHelpers/getShadowStyle";
import useUserMe from "sharedHooks/useUserMe";
import colors from "styles/tailwindColors";

const Tab = createBottomTabNavigator();

const OBS_LIST_SCREEN_ID = "ObsList";
const EXPLORE_SCREEN_ID = "Explore";
const MESSAGES_SCREEN_ID = "Messages";

// @todo fix this....
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { state, descriptors, navigation } ) => {
  const tabs = state.routes.map( route => {
    const { options } = descriptors[route.key];

    const onPress = () => {
      navigation.navigate( { name: route.name, merge: true } );
    };
    const { history } = state;
    const currentRoute = history[history.length - 1]?.key || "";
    return (
      <NavButton
        {...options.meta}
        onPress={onPress}
        active={currentRoute.includes( route.name )}
      />
    );
  } );

  tabs.splice( -2, 0, <AddObsButton /> );

  const footerHeight = Platform.OS === "ios" ? "h-20" : "h-15";

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center pb-2",
        footerHeight
      )}
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: -3,
        opacity: 0.2,
        radius: 5
      } )}
      accessibilityRole="tablist"
    >
      {tabs}
    </View>
  );
};

const BottomTabs = () => {
  const { remoteUser: user } = useUserMe();

  return (
    <Tab.Navigator
      initialRouteName={OBS_LIST_SCREEN_ID}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          meta: {
            icon: "compass-rose",
            testID: EXPLORE_SCREEN_ID,
            accessibilityLabel: t( "Explore" ),
            accessibilityHint: t( "Navigates-to-explore" ),
            size: 40
          }
        }}
      />
      <Tab.Screen
        name="ObsList"
        component={ObsList}
        options={{
          meta: {
            icon: "ios-people-updated-2",
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
          meta: {
            icon: "notifications-bell",
            testID: MESSAGES_SCREEN_ID,
            accessibilityLabel: t( "Messages" ),
            accessibilityHint: t( "Navigates-to-messages" ),
            size: 40
          }
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
