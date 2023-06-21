// @flow

import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import {
  INatIcon,
  UserIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import User from "realmModels/User";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  state: any,
  navigation: any,
  descriptors: any
}

const CustomDrawerContent = ( { ...props }: Props ): Node => {
  // $FlowFixMe
  const { state, navigation, descriptors } = props;
  const currentUser = useCurrentUser( );
  const theme = useTheme( );
  const { t } = useTranslation( );

  const labelStyle = {
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 2,
    fontFamily: `Whitney-Light${Platform.OS === "ios"
      ? ""
      : "-Pro"}`,
    color: theme.colors.primary,
    fontWeight: "700",
    textAlign: "left",
    textAlignVertical: "center"
  };

  const drawerItems = {
    search: {
      label: t( "SEARCH" ),
      navigation: "search",
      icon: "magnifying-glass"
    },
    identify: {
      label: t( "IDENTIFY" ),
      navigation: "Identify",
      icon: "label"
    },
    projects: {
      label: t( "PROJECTS" ),
      navigation: "Projects",
      icon: "briefcase"
    },
    help: {
      label: t( "HELP" ),
      navigation: "Help",
      icon: "help-circle"
    },
    blog: {
      label: t( "BLOG" ),
      navigation: "Blog",
      icon: "laptop"
    },
    about: {
      label: t( "ABOUT" ),
      navigation: "about",
      icon: "inaturalist"
    },
    donate: {
      label: t( "DONATE" ),
      navigation: "Donate",
      icon: "heart"
    },
    settings: {
      label: t( "SETTINGS" ),
      navigation: "settings",
      icon: "gear"
    },
    // these two are only for development mode
    network: {
      label: t( "NETWORK" ),
      navigation: "network",
      icon: "help"
    },
    uiLibrary: {
      label: t( "UI-LIBRARY" ),
      navigation: "UI Library",
      icon: "help"
    },
    login: {
      label: currentUser
        ? t( "LOG-OUT" )
        : t( "LOG-IN" ),
      navigation: "Login",
      icon: "door-exit"
    }
  };

  const renderIcon = item => <INatIcon name={drawerItems[item].icon} size={15} />;

  return (
    <DrawerContentScrollView state={state} navigation={navigation} descriptors={descriptors}>
      <UserIcon
        uri={User.uri( currentUser )}
      />
      <View className="ml-5">
        {Object.keys( drawerItems ).map( item => (
          <DrawerItem
            label={drawerItems[item].label}
            onPress={( ) => navigation.navigate( drawerItems[item].navigation )}
            labelStyle={labelStyle}
            icon={( ) => renderIcon( item )}
          />
        ) )}
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
