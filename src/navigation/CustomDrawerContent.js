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
import { fontRegular } from "constants/fontFamilies.ts";
import type { Node } from "react";
import React, { useCallback, useMemo } from "react";
import { Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import User from "realmModels/User";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { useCurrentUser, useDebugMode, useTranslation } from "sharedHooks";
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
  const { state, navigation, descriptors } = props;
  const currentUser = useCurrentUser( );
  const theme = useTheme( );
  const { t } = useTranslation( );
  const { isDebug } = useDebugMode( );

  const labelStyle = useMemo( ( ) => ( {
    fontSize: 16,
    lineHeight: 19.2,
    letterSpacing: 2,
    fontFamily: fontRegular,
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

  const drawerItems = useMemo( ( ) => {
    const items: any = {
      // search: {
      //   label: t( "SEARCH" ),
      //   navigation: "search",
      //   icon: "magnifying-glass"
      // },
      projects: {
        label: t( "PROJECTS" ),
        navigation: "Projects",
        icon: "briefcase"
      },
      // blog: {
      //   label: t( "BLOG" ),
      //   navigation: "Blog",
      //   icon: "laptop"
      // },
      about: {
        label: t( "ABOUT" ),
        navigation: "About",
        icon: "inaturalist"
      },
      donate: {
        label: t( "DONATE" ),
        navigation: "Donate",
        icon: "heart"
      },
      help: {
        label: t( "HELP" ),
        navigation: "Help",
        icon: "help-circle"
      },
      settings: {
        testID: "settings",
        label: t( "SETTINGS" ),
        navigation: "Settings",
        icon: "gear"
      },
      login: {
        label: currentUser
          ? t( "LOG-OUT" )
          : t( "LOG-IN" ),
        navigation: "LoginStackNavigator",
        icon: "door-exit",
        style: {
          opacity: 0.5,
          display: currentUser
            ? "flex"
            : "none"
        }
      }
    };
    if ( isDebug ) {
      items.debug = {
        label: "DEBUG",
        navigation: "Debug",
        icon: "triangle-exclamation",
        color: "deeppink"
      };
    }
    return items;
  }, [
    currentUser,
    isDebug,
    t
  ] );

  const renderIcon = useCallback( item => (
    <INatIconButton
      icon={drawerItems[item].icon}
      size={20}
      color={drawerItems[item].color}
      accessibilityLabel={drawerItems[item].label}
    />
  ), [drawerItems] );

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
          navigation.navigate( "LoginStackNavigator" );
        } else {
          navigation.navigate( "ObsList" );
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
        testID={drawerItems[item].testID}
        label={drawerItems[item].label}
        onPress={( ) => {
          navigation.navigate( drawerItems[item].navigation, drawerItems[item].params );
        }}
        labelStyle={labelStyle}
        icon={( ) => renderIcon( item )}
        style={[drawerItemStyle, drawerItems[item].style]}
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
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
