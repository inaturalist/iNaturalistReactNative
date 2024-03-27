// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import User from "realmModels/User";
import { useCurrentUser, useTranslation } from "sharedHooks";

import CustomTabBar from "./CustomTabBar";

const DRAWER_ID = "OPEN_DRAWER";
const EXPLORE_SCREEN_ID = "RootExplore";
const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";
const NOTIFICATIONS_SCREEN_ID = "Notifications";

type Props = {
  navigation: Object
};

const CustomTabBarContainer = ( { navigation }: Props ): Node => {
  const { t } = useTranslation( );
  const currentUser = useCurrentUser( );
  const [activeTab, setActiveTab] = useState( OBS_LIST_SCREEN_ID );
  const isDrawerOpen = useDrawerStatus() === "open";

  const tabs = useMemo( ( ) => ( [
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
      accessibilityLabel: t( "Navigate-to-explore-screen" ),
      accessibilityHint: t( "Navigates-to-explore" ),
      size: 40,
      onPress: ( ) => {
        navigation.navigate( "RootExplore" );
        setActiveTab( EXPLORE_SCREEN_ID );
      },
      active: EXPLORE_SCREEN_ID === activeTab
    },
    {
      icon: "person",
      userIconUri: User.uri( currentUser ),
      testID: "NavButton.personIcon",
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
      testID: NOTIFICATIONS_SCREEN_ID,
      accessibilityLabel: t( "Notifications" ),
      accessibilityHint: t( "Navigates-to-notifications" ),
      size: 32,
      onPress: ( ) => {
        navigation.reset( {
          index: 0,
          routes: [
            {
              name: "ObservationsStackNavigator",
              params: {
                screen: "Notifications"
              }
            }
          ]
        } );
        setActiveTab( NOTIFICATIONS_SCREEN_ID );
      },
      active: NOTIFICATIONS_SCREEN_ID === activeTab
    }
  ] ), [
    activeTab,
    currentUser,
    isDrawerOpen,
    navigation,
    t
  ] );

  return (
    <CustomTabBar
      tabs={tabs}
    />
  );
};

export default CustomTabBarContainer;
