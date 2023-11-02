// @flow

import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import classnames from "classnames";
import {
  Body1,
  INatIconButton,
  List2,
  UserIcon
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { Dimensions, Platform } from "react-native";
import { useTheme } from "react-native-paper";
import User from "realmModels/User";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useCurrentUser, useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

const { width } = Dimensions.get( "screen" );

const drawerScrollViewStyle = {
  backgroundColor: "white",
  borderTopRightRadius: 20,
  borderBottomRightRadius: 20,
  height: "100%"
};

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

  const labelStyle = useMemo( ( ) => ( {
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
  } ), [theme.colors.primary] );

  const drawerItemStyle = useMemo( ( ) => ( {
    marginBottom: width <= BREAKPOINTS.lg
      ? -15
      : -5
  } ), [] );

  const loginDrawerItemStyle = useMemo( ( ) => ( {
    ...drawerItemStyle,
    opacity: 0.5,
    display: currentUser
      ? "flex"
      : "none"
  } ), [currentUser, drawerItemStyle] );

  const drawerItems = useMemo( ( ) => ( {
    search: {
      label: t( "SEARCH" ),
      navigation: "search",
      icon: "magnifying-glass"
    },
    identify: {
      label: t( "IDENTIFY" ),
      navigation: "TabNavigator",
      params: {
        screen: "ObservationsStackNavigator",
        params: {
          screen: "Identify"
        }
      },
      icon: "label",
      loggedInOnly: true
    },
    projects: {
      label: t( "PROJECTS" ),
      navigation: "TabNavigator",
      params: {
        screen: "ProjectsStackNavigator",
        params: {
          screen: "Projects"
        }
      },
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
    }
  } ), [t] );

  const renderIcon = useCallback( item => {
    let color = null;
    let backgroundColor = null;

    if ( item === "help" ) {
      color = colors.white;
      backgroundColor = colors.darkGray;
    }
    return (
      <INatIconButton
        icon={drawerItems[item].icon}
        size={20}
        color={color}
        backgroundColor={backgroundColor}
        accessibilityLabel={drawerItems[item].label}
      />
    );
  }, [drawerItems] );

  const renderTopBanner = useCallback( ( ) => (
    <Pressable
      accessibilityRole="button"
      className={classnames(
        currentUser
          ? "ml-5"
          : "ml-3",
        "mb-5",
        "flex-row",
        "flex-nowrap"
      )}
      onPress={( ) => {
        if ( !currentUser ) {
          navigation.navigate( "LoginNavigator" );
        } else {
          navigation.navigate( "TabNavigator", {
            screen: "ObservationsStackNavigator",
            params: {
              screen: "ObsList"
            }
          } );
        }
      }}
    >
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
            accessibilityLabel="iNaturalist"
            accessibilityHint={t( "Shows-iNaturalist-bird-logo" )}
          />
        ) }
      <View className="ml-3 justify-center">
        <Body1>
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
    </Pressable>
  ), [currentUser, navigation, t] );

  const renderDrawerItem = useCallback( item => {
    if ( drawerItems[item].loggedInOnly && !currentUser ) {
      return null;
    }
    return (
      <DrawerItem
        key={drawerItems[item].label}
        label={drawerItems[item].label}
        onPress={( ) => {
          navigation.navigate( drawerItems[item].navigation, drawerItems[item].params );
        }}
        labelStyle={labelStyle}
        icon={( ) => renderIcon( item )}
        style={drawerItemStyle}
      />
    );
  }, [
    currentUser,
    drawerItemStyle,
    labelStyle,
    renderIcon,
    drawerItems,
    navigation
  ] );

  const renderBottomLoginButton = useCallback( ( ) => {
    const signOutButton = ( ) => (
      <INatIconButton
        icon="door-exit"
        size={20}
        accessibilityLabel={t( "Log-out" )}
      />
    );

    return (
      <DrawerItem
        label={
          currentUser
            ? t( "LOG-OUT" )
            : t( "LOG-IN" )
        }
        onPress={( ) => {
          navigation.navigate( "LoginNavigator" );
        }}
        labelStyle={labelStyle}
        icon={signOutButton}
        style={loginDrawerItemStyle}
      />
    );
  }, [
    currentUser,
    labelStyle,
    loginDrawerItemStyle,
    navigation,
    t
  ] );

  return (
    <DrawerContentScrollView
      state={state}
      navigation={navigation}
      descriptors={descriptors}
      contentContainerStyle={drawerScrollViewStyle}
    >
      <View className="py-5 flex h-full justify-between">
        {renderTopBanner( )}
        <View className="grow">
          {Object.keys( drawerItems ).map( item => renderDrawerItem( item ) )}
        </View>
        <View className="h-[66px]">
          {renderBottomLoginButton( )}
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
