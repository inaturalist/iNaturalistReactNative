// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import getShadowStyle from "sharedHelpers/getShadowStyle";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

type Props = {
  state: Object,
  descriptors: Object,
  navigation: Object,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { state, descriptors, navigation }: Props ): Node => {
  const isDrawerOpen = useDrawerStatus( ) === "open";

  const tabs = state.routes.reduce( ( tabList, route ) => {
    const { options } = descriptors[route.key];

    const onPress = ( ) => {
      navigation.navigate( { name: route.name, merge: true } );
    };
    const { history } = state;
    const currentRoute = history[history.length - 1]?.key || "";
    if ( options.meta ) {
      tabList.push(
        <NavButton
          {...options.meta}
          key={route.name}
          onPress={onPress}
          active={currentRoute.includes( route.name )}
        />
      );
    }

    return tabList;
  }, [] );

  tabs.splice( -2, 0, <AddObsButton key="AddObsButton" /> );
  tabs.unshift(
    <NavButton
      onPress={( ) => navigation.openDrawer( )}
      icon="hamburger-menu"
      accessibilityRole="button"
      accessibilityLabel={t( "Open-drawer" )}
      accessibilityHint={t( "Opens-the-side-drawer-menu" )}
      testID="OPEN_DRAWER"
      active={isDrawerOpen}
      size={32}
      key="DrawerToggle"
    />
  );

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

export default CustomTabBar;
