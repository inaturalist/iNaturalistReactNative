// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import User from "realmModels/User";
import { useCurrentUser, useTranslation } from "sharedHooks";

import CustomTabBar from "./CustomTabBar";

const DRAWER_ID = "OPEN_DRAWER";
const EXPLORE_SCREEN_ID = "Explore";
const OBS_LIST_SCREEN_ID = "ObservationsStackNavigator";
const NOTIFICATIONS_SCREEN_ID = "Notifications";

type Props = {
  navigation: Object,
  isOnline: boolean
};

const CustomTabBarContainer = ( { navigation, isOnline }: Props ): Node => {
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
      width: 44,
      height: 44,
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
      width: 44,
      height: 44,
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
      userIconUri: isOnline
        ? User.uri( currentUser )
        : null,
      testID: User.uri( currentUser ) && isOnline
        ? "NavButton.avatar"
        : "NavButton.personIcon",
      accessibilityLabel: t( "Observations" ),
      accessibilityHint: t( "Navigates-to-observations" ),
      width: 44,
      height: 44,
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
      width: 44,
      height: 44,
      size: 32,
      onPress: ( ) => {
        navigation.navigate( "Notifications" );
        setActiveTab( NOTIFICATIONS_SCREEN_ID );
      },
      active: NOTIFICATIONS_SCREEN_ID === activeTab
    }
  ] ), [
    activeTab,
    isOnline,
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
