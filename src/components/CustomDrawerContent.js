// @flow

import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import {
  Body1,
  INatIconButton,
  List2,
  UserIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Dimensions, Platform } from "react-native";
import { useTheme } from "react-native-paper";
import User from "realmModels/User";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useCurrentUser, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  state: any,
  navigation: any,
  descriptors: any
}

const { width, height } = Dimensions.get( "screen" );

console.log( width, BREAKPOINTS.md, "width breakpoints" );

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
    textAlignVertical: "center",
    marginLeft: -20
  };

  const drawerItemStyle = {
    marginBottom: width <= BREAKPOINTS.lg
      ? -15
      : -5
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
      icon: "label",
      loggedInOnly: true
    },
    projects: {
      label: t( "PROJECTS" ),
      navigation: "Projects",
      icon: "briefcase"
    },
    help: {
      label: t( "HELP" ),
      navigation: "Help",
      icon: "help"
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
      icon: "gear",
      loggedInOnly: true
    },
    // the following two are only for development mode,
    // and should not be included in future app store releases
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
      icon: "door-exit",
      loggedInOnly: true
    }
  };

  const renderIcon = item => {
    let color = null;
    let backgroundColor = null;

    if ( item === "help" ) {
      color = colors.white;
      backgroundColor = colors.darkGray;
    }
    return (
      <INatIconButton
        icon={drawerItems[item].icon}
        size={15}
        color={color}
        backgroundColor={backgroundColor}
      />
    );
  };

  const drawerScrollViewStyle = {
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    height
  };

  return (
    <DrawerContentScrollView
      state={state}
      navigation={navigation}
      descriptors={descriptors}
      contentContainerStyle={drawerScrollViewStyle}
    >
      <View className="ml-4 mb-8 flex-row flex-nowrap">
        {currentUser
          ? (
            <UserIcon
              uri={User.uri( currentUser )}
            />
          )
          : (
            <INatIconButton
              icon="inaturalist"
              size={40}
              color={colors.inatGreen}
              onPress={( ) => navigation.navigate( "Login" )}
            />
          ) }
        <View className="ml-3 justify-center">
          <Body1
            onPress={( ) => {
              if ( !currentUser ) {
                navigation.navigate( "Login" );
              }
            }}
          >
            {currentUser
              ? User.userHandle( currentUser )
              : t( "Log-in-to-iNaturalist" )}
          </Body1>
          {currentUser && (
            <List2>
              {t( "X-Observations", { count: currentUser.observations_count } )}
            </List2>
          )}
        </View>
      </View>
      <View className="ml-3">
        {Object.keys( drawerItems ).map( item => {
          if ( drawerItems[item].loggedInOnly && !currentUser ) {
            return null;
          }
          return (
            <DrawerItem
              key={drawerItems[item].label}
              label={drawerItems[item].label}
              onPress={( ) => navigation.navigate( drawerItems[item].navigation )}
              labelStyle={labelStyle}
              icon={( ) => renderIcon( item )}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                ...drawerItemStyle,
                opacity: ( item === "login" )
                  ? 0.5
                  : 1
              }}
            />
          );
        } )}
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
