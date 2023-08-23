// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React, { useState } from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import { useCurrentUser } from "sharedHooks";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

const DRAWER_ID = "OPEN_DRAWER";
const EXPLORE_SCREEN_ID = "Explore";
const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";
const MESSAGES_SCREEN_ID = "Messages";

type Props = {
  navigation: Object,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { navigation }: Props ): Node => {
  const currentUser = useCurrentUser( );
  const [activeTab, setActiveTab] = useState( OBS_LIST_SCREEN_ID );
  const isDrawerOpen = useDrawerStatus() === "open";

  const tabs = [
    {
      icon: "hamburger-menu",
      testID: DRAWER_ID,
      accessibilityLabel: t( "Open-drawer" ),
      accessibilityHint: t( "Opens-the-side-drawer-menu" ),
      size: 32,
      onPress: ( ) => {
        navigation.openDrawer( );
        setActiveTab( null );
      },
      active: isDrawerOpen
    },
    {
      icon: "compass-rose-outline",
      testID: EXPLORE_SCREEN_ID,
      accessibilityLabel: t( "Explore" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "ObservationsStackNavigator", {
          screen: "Explore"
        } );
        setActiveTab( EXPLORE_SCREEN_ID );
      },
      active: EXPLORE_SCREEN_ID === activeTab
    },
    {
      icon: "person",
      userIconUri: User.uri( currentUser ),
      testID: OBS_LIST_SCREEN_ID,
      accessibilityLabel: t( "Observations" ),
      accessibilityHint: t( "Navigates-to-observations" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "ObservationsStackNavigator", {
          screen: "ObsList"
        } );
        setActiveTab( OBS_LIST_SCREEN_ID );
      },
      active: OBS_LIST_SCREEN_ID === activeTab
    },
    {
      icon: "notifications-bell",
      testID: MESSAGES_SCREEN_ID,
      accessibilityLabel: t( "Messages" ),
      accessibilityHint: t( "Navigates-to-messages" ),
      size: 32,
      onPress: ( ) => {
        navigation.navigate( "Messages" );
        setActiveTab( MESSAGES_SCREEN_ID );
      },
      active: MESSAGES_SCREEN_ID === activeTab
    }
  ];

  const tabList = tabs.map( tab => (
    <View key={tab.testID}>
      <NavButton {...tab} />
    </View>
  ) );

  tabList.splice( -2, 0, <AddObsButton key="AddObsButton" /> );

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center p-1 m-0",
        { "pb-5": Platform.OS === "ios" }
      )}
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: -3,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 20
      } )}
      accessibilityRole="tablist"
    >
      {tabList}
    </View>
  );
};

export default CustomTabBar;
