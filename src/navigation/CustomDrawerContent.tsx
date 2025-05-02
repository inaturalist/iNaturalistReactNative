import { useNetInfo } from "@react-native-community/netinfo";
import {
  DrawerContentScrollView,
  DrawerItem
} from "@react-navigation/drawer";
import { useQueryClient } from "@tanstack/react-query";
import classnames from "classnames";
import {
  signOut
} from "components/LoginSignUp/AuthenticationService.ts";
import {
  Body1,
  Heading4,
  INatIcon,
  INatIconButton,
  List2, TextInputSheet,
  UserIcon,
  WarningSheet
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Dimensions, ViewStyle } from "react-native";
import User from "realmModels/User.ts";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore, { zustandStorage } from "stores/useStore";
import colors from "styles/tailwindColors";

const { useRealm } = RealmContext;

const { width } = Dimensions.get( "screen" );

function isDefaultMode( ) {
  return useStore.getState( ).layout.isDefaultMode === true;
}

const drawerScrollViewStyle = {
  backgroundColor: "white",
  borderTopRightRadius: 20,
  borderBottomRightRadius: 20,
  minHeight: "100%"
} as const;

interface Props {
  state: Object;
  navigation: Object;
  descriptors: Object;
}

const feedbackLogger = log.extend( "feedback" );

function showOfflineAlert( t ) {
  Alert.alert( t( "You-are-offline" ), t( "Please-try-again-when-you-are-online" ) );
}

const CustomDrawerContent = ( { state, navigation, descriptors }: Props ) => {
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );
  const isDebug = zustandStorage.getItem( "debugMode" ) === "true";
  const { isConnected } = useNetInfo( );

  const [showConfirm, setShowConfirm] = useState( false );
  const [showFeedback, setShowFeedback] = useState( false );

  const drawerItemStyle = useMemo( ( ) => ( {
    marginBottom: width <= BREAKPOINTS.lg
      ? -15
      : -5
  } as const ), [] );

  interface DrawerItem {
    label: string;
    navigation?: string;
    icon: string;
    color?: string;
    style?: ViewStyle;
    onPress?: ( ) => void;
    testID?: string;
  }
  const drawerItems = useMemo( ( ) => {
    const items: {
      [key: string]: DrawerItem;
    } = {
      // search: {
      //   label: t( "SEARCH" ),
      //   navigation: "search",
      //   icon: "magnifying-glass"
      // },
      // blog: {
      //   label: t( "BLOG" ),
      //   navigation: "Blog",
      //   icon: "laptop"
      // },
      projects: {
        label: t( "PROJECTS" ),
        navigation: "Projects",
        icon: "briefcase"
      },
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
      }
    };
    items.feedback = {
      label: t( "FEEDBACK" ),
      icon: "feedback",
      onPress: ( ) => {
        if ( isConnected ) {
          setShowFeedback( true );
        } else {
          showOfflineAlert( t );
        }
      }
    };

    if ( currentUser ) {
      items.logout = {
        label: t( "LOG-OUT" ),
        icon: "door-exit",
        style: {
          opacity: 0.5,
          display: "flex"
        },
        onPress: ( ) => setShowConfirm( true )
      };
    }

    if ( items.logout === undefined && !currentUser ) {
      items.login = {
        label: t( "LOG-IN" ),
        icon: "door-enter",
        style: {
          opacity: 0.5,
          display: "flex"
        },
        onPress: ( ) => {
          navigation.navigate( "LoginStackNavigator" );
        }
      };
    }
    if ( isDebug ) {
      items.debug = {
        label: "DEBUG",
        navigation: "Debug",
        icon: "triangle-exclamation",
        color: "deeppink"
      };
    }
    return items;
  }, [currentUser, isConnected, isDebug, navigation, t] );

  const onSignOut = async ( ) => {
    await signOut( { realm, clearRealm: true, queryClient } );
    setShowConfirm( false );

    // TODO might be necessary to restart the app at this point. We just
    // deleted the realm file on disk, but the RealmProvider may still have a
    // copy of realm in local state
    navigation.goBack( );
  };

  const renderIcon = useCallback( ( key: string ) => (
    <INatIcon
      name={drawerItems[key].icon}
      size={22}
      color={drawerItems[key].color}
    />
  ), [drawerItems] );

  const renderLabel = useCallback( ( label: string ) => (
    <Heading4>
      {label}
    </Heading4>
  ), [] );

  const renderTopBanner = useCallback( ( ) => (
    <Pressable
      testID="drawer-top-banner"
      accessibilityRole="button"
      className={classnames(
        currentUser
          ? "ml-5"
          : "ml-3",
        "mb-5",
        "flex-row",
        "flex-nowrap",
        "mr-3"
      )}
      onPress={( ) => {
        if ( !currentUser ) {
          navigation.navigate( "LoginStackNavigator" );
        } else {
          navigation.navigate( "UserProfile", { userId: currentUser.id } );
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
            ? currentUser?.login
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

  const renderDrawerItem = useCallback( ( key: string ) => (
    <View
      className="mb-6"
      key={drawerItems[key].label}
    >
      <DrawerItem
        testID={drawerItems[key].testID}
        accessibilityLabel={drawerItems[key].label}
        icon={( ) => renderIcon( key )}
        label={() => renderLabel( drawerItems[key].label )}
        onPress={( ) => {
          if ( drawerItems[key].navigation ) {
            navigation.navigate( drawerItems[key].navigation );
          }
          if ( drawerItems[key].onPress ) {
            drawerItems[key].onPress();
          }
        }}
        style={[drawerItemStyle, drawerItems[key].style]}
      />
    </View>
  ), [
    drawerItemStyle,
    renderLabel,
    renderIcon,
    drawerItems,
    navigation
  ] );

  const submitFeedback = useCallback( ( text: string ) => {
    if ( !isConnected ) {
      showOfflineAlert( t );
      return false;
    }
    const mode = isDefaultMode( )
      ? "DEFAULT:"
      : "ADVANCED:";
    feedbackLogger.info( mode, text );
    Alert.alert( t( "Feedback-Submitted" ), t( "Thank-you-for-sharing-your-feedback" ) );
    setShowFeedback( false );
    return true;
  }, [isConnected, t] );

  return (
    <DrawerContentScrollView
      state={state}
      navigation={navigation}
      descriptors={descriptors}
      contentContainerStyle={drawerScrollViewStyle}
    >
      <View className="py-5 flex">
        {renderTopBanner( )}
        <View className="ml-3">
          {Object.keys( drawerItems ).map( item => renderDrawerItem( item ) )}
        </View>
      </View>
      {showConfirm && (
        <WarningSheet
          onPressClose={() => setShowConfirm( false )}
          headerText={t( "LOG-OUT--question" )}
          text={t( "Are-you-sure-you-want-to-log-out" )}
          handleSecondButtonPress={() => setShowConfirm( false )}
          secondButtonText={t( "CANCEL" )}
          confirm={onSignOut}
          buttonText={t( "LOG-OUT" )}
        />
      )}
      {showFeedback && (
        <TextInputSheet
          hidden={!showFeedback}
          buttonText={t( "SUBMIT" )}
          onPressClose={() => setShowFeedback( false )}
          headerText={t( "FEEDBACK" )}
          confirm={submitFeedback}
          description={t( "Thanks-for-using-any-suggestions" )}
          maxLength={1000}
        />
      )}
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
