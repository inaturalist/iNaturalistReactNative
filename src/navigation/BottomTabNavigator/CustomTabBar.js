// @flow
import { useDrawerStatus } from "@react-navigation/drawer";
import classNames from "classnames";
import AddObsButton from "components/SharedComponents/Buttons/AddObsButton";
import { View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { getShadowStyle } from "styles/global";
import colors from "styles/tailwindColors";

import NavButton from "./NavButton";

type Props = {
  state: Object,
  descriptors: Object,
  navigation: Object,
};

/* eslint-disable react/jsx-props-no-spreading */

const CustomTabBar = ( { state, descriptors, navigation }: Props ): Node => {
  const isDrawerOpen = useDrawerStatus() === "open";
  const { history } = state;
  const currentRoute = history[history.length - 1]?.key || "";

  const tabs = state.routes.reduce( ( tabList, route ) => {
    const { options } = descriptors[route.key];

    const onPress = () => {
      navigation.navigate( { name: route.name, merge: true } );
    };

    if ( options.meta ) {
      tabList.push(
        <View
          className="w-[68px] h-[68px] flex items-center justify-center"
          key={route.name}
        >
          <NavButton
            {...options.meta}
            onPress={onPress}
            active={currentRoute.includes( route.name )}
          />
        </View>
      );
    }

    return tabList;
  }, [] );

  tabs.splice( -2, 0, <AddObsButton key="AddObsButton" /> );
  tabs.unshift(
    <View
      className="w-[68px] h-[68px] flex items-center justify-center"
      key="DrawerToggle"
    >
      <NavButton
        onPress={() => navigation.openDrawer()}
        icon="hamburger-menu"
        accessibilityRole="button"
        accessibilityLabel={t( "Open-drawer" )}
        accessibilityHint={t( "Opens-the-side-drawer-menu" )}
        testID="OPEN_DRAWER"
        active={isDrawerOpen}
        size={32}
      />
    </View>
  );

  const footerHeight = Platform.OS === "ios" ? "h-80px]" : "h-20";

  // Hacky solution but is required to show ContextHeader shadow in PhotoGallery
  // when PhotoGallery is hoisted to stack navigator, the header is rendered first
  // and zIndex/elevation is not respected, thus the child screen cuts off the shadow
  // there isn't a built in option to hide bottom tabs in react-navigation
  if (
    currentRoute.includes( "PhotoGallery" )
    || currentRoute.includes( "GroupPhotos" )
    || currentRoute.includes( "StandardCamera" )
    || currentRoute.includes( "SoundRecorder" )
    || currentRoute.includes( "ObsEdit" )
    || currentRoute.includes( "AddID" )
    || currentRoute.includes( "Login" )
  ) {
    return null;
  }

  return (
    <View
      className={classNames(
        "flex flex-row absolute bottom-0 bg-white w-full justify-evenly items-center p-1",
        { "pb-5": Platform.OS === "ios" },
        footerHeight
      )}
      style={getShadowStyle( {
        shadowColor: colors.black,
        offsetWidth: 0,
        offsetHeight: -3,
        shadowOpacity: 0.2,
        shadowRadius: 2,
        radius: 5,
        elevation: 5
      } )}
      accessibilityRole="tablist"
    >
      {tabs}
    </View>
  );
};

export default CustomTabBar;
