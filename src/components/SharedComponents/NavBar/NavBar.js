// @flow
import { useNavigation } from "@react-navigation/native";
import cx from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import * as React from "react";
import { Platform } from "react-native";
import User from "realmModels/User";
import useUserMe from "sharedHooks/useUserMe";
import { viewStyles } from "styles/sharedComponents/footer";

import NavButton from "./NavButton";

const OBS_LIST_SCREEN_ID = "ObsList";
const EXPLORE_SCREEN_ID = "ExploreLanding";
const MESSAGES_SCREEN_ID = "Messages";

const NavBar = (): React.Node => {
  const navigation = useNavigation();
  const toggleSideMenu = () => {
    console.log( "wtf" );
    navigation.openDrawer();
  };
  const navToObsList = () => navigation.navigate( "MainStack", { screen: OBS_LIST_SCREEN_ID } );
  const navToExplore = () => navigation.navigate( "MainStack", { screen: EXPLORE_SCREEN_ID } );
  const navToNotifications = () => navigation.navigate( "MainStack", {
    screen: MESSAGES_SCREEN_ID
  } );
  const { remoteUser: user } = useUserMe();

  const footerHeight = Platform.OS === "ios" ? "h-20" : "h-15";

  return (
    <View
      className={cx(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center pb-2",
        footerHeight
      )}
      style={viewStyles.shadow}
    >
      <NavButton onPress={toggleSideMenu} icon="menu" />
      <NavButton
        onPress={navToExplore}
        icon="language"
        id={EXPLORE_SCREEN_ID}
      />
      <AddObsButton />
      <NavButton
        onPress={navToObsList}
        icon="person"
        img={User.uri( user )}
        id={OBS_LIST_SCREEN_ID}
      />
      <NavButton
        onPress={navToNotifications}
        icon="notifications"
        id={MESSAGES_SCREEN_ID}
      />
    </View>
  );
};

export default NavBar;
