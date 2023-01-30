// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import { useNavigation, useRoute } from "@react-navigation/native";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import * as React from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import useUserMe from "sharedHooks/useUserMe";
import { viewStyles } from "styles/sharedComponents/footer";

import NavButton from "./NavButton";

const OBS_LIST_SCREEN_ID = "ObsList";
const EXPLORE_SCREEN_ID = "ExploreLanding";
const MESSAGES_SCREEN_ID = "Messages";

const NavBar = ( ): React.Node => {
  const navigation = useNavigation( );
  const { name } = useRoute();
  const isDrawerOpen = useDrawerStatus() === "open";
  const toggleSideMenu = ( ) => navigation.openDrawer( );
  const navToObsList = ( ) => navigation.navigate( "MainStack", { screen: OBS_LIST_SCREEN_ID } );
  const navToExplore = ( ) => navigation.navigate( "MainStack", { screen: EXPLORE_SCREEN_ID } );
  const navToNotifications = ( ) => navigation.navigate( "MainStack", {
    screen: MESSAGES_SCREEN_ID
  } );
  const { remoteUser: user } = useUserMe( );

  const footerHeight = Platform.OS === "ios" ? "h-20" : "h-15";

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center pb-2",
        footerHeight
      )}
      style={viewStyles.shadow}
    >
      <NavButton
        onPress={toggleSideMenu}
        icon="menu"
        accessibilityLabel={t( "Navigate-to-observations" )}
        accessibilityRole="button"
        id="OPEN_DRAWER"
        active={isDrawerOpen}
        size={32}
      />
      <NavButton
        onPress={navToExplore}
        icon="language"
        id={EXPLORE_SCREEN_ID}
        active={name === EXPLORE_SCREEN_ID}
        accessibilityLabel={t( "Navigate-to-notifications" )}
        size={40}
      />
      <AddObsButton />
      <NavButton
        onPress={navToObsList}
        icon="person"
        img={User.uri( user )}
        id={OBS_LIST_SCREEN_ID}
        active={name === OBS_LIST_SCREEN_ID}
        accessibilityLabel={t( "Open-sidebar" )}
        size={40}
      />
      <NavButton
        onPress={navToNotifications}
        icon="notifications"
        active={name === MESSAGES_SCREEN_ID}
        id={MESSAGES_SCREEN_ID}
        accessibilityLabel={t( "Navigate-to-map" )}
        size={32}
      />
    </View>
  );
};

export default NavBar;
