// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import { useRoute } from "@react-navigation/native";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import {
  EXPLORE_NAME,
  MESSAGES_NAME,
  OBS_LIST_NAME
} from "navigation/navigationIds";
import * as React from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import useINatNavigation from "sharedHooks/useINatNavigation";
import useUserMe from "sharedHooks/useUserMe";
import { viewStyles } from "styles/sharedComponents/footer";

import NavButton from "./NavButton";

const NavBar = ( ): React.Node => {
  const navigation = useINatNavigation( );
  const { name } = useRoute( );
  const isDrawerOpen = useDrawerStatus( ) === "open";
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( OBS_LIST_NAME );
  const navToExplore = ( ) => navigation.navigate( EXPLORE_NAME );
  const navToNotifications = ( ) => navigation.navigate(
    MESSAGES_NAME
  );
  const { remoteUser: user } = useUserMe( );

  const footerHeight = Platform.OS === "ios" ? "h-20" : "h-15";

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center pb-2",
        footerHeight
      )}
      style={viewStyles.shadow}
      accessibilityRole="tablist"
    >
      <NavButton
        onPress={toggleSideMenu}
        icon="hamburger-menu"
        accessibilityRole="button"
        accessibilityLabel={t( "Open-drawer" )}
        accessibilityHint={t( "Opens-the-side-drawer-menu" )}
        testID="OPEN_DRAWER"
        active={isDrawerOpen}
        size={32}
      />
      <NavButton
        onPress={navToExplore}
        icon="compass-rose"
        testID={EXPLORE_NAME}
        active={name === EXPLORE_NAME}
        accessibilityLabel={t( "Explore" )}
        accessibilityHint={t( "Navigates-to-explore" )}
        size={40}
      />
      <AddObsButton />
      <NavButton
        onPress={navToObsList}
        icon="ios-people-updated-2"
        userIconUri={User.uri( user )}
        testID={OBS_LIST_NAME}
        active={name === OBS_LIST_NAME}
        accessibilityLabel={t( "Observations" )}
        accessibilityHint={t( "Navigates-to-observations" )}
        size={40}
      />
      <NavButton
        onPress={navToNotifications}
        icon="notifications-bell"
        active={name === MESSAGES_NAME}
        testID={MESSAGES_NAME}
        accessibilityLabel={t( "Messages" )}
        accessibilityHint={t( "Navigates-to-messages" )}
        size={32}
      />
    </View>
  );
};

export default NavBar;
