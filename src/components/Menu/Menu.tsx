import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  signOut,
} from "components/LoginSignUp/AuthenticationService";
import {
  Body1,
  INatIcon,
  List2, TextInputSheet,
  UserIcon,
  WarningSheet,
} from "components/SharedComponents";
import { Pressable, ScrollView, View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Observation from "realmModels/Observation";
import User from "realmModels/User";
import { valueToBreakpoint } from "sharedHelpers/breakpoint";
import { log } from "sharedHelpers/logger";
import { useCurrentUser, useLayoutPrefs, useTranslation } from "sharedHooks";
import { zustandStorage } from "stores/useStore";
import colors from "styles/tailwindColors";

import MenuItem from "./MenuItem";

const { useRealm } = RealmContext;

interface BaseMenuOption {
  label: string;
  icon: string;
  color?: string;
  testID?: string;
  isLogout?: boolean;
}

interface MenuOptionWithNavigation extends BaseMenuOption {
  navigation: string;
  onPress?: never;
}

interface MenuOptionWithOnPress extends BaseMenuOption {
  onPress: ( ) => void;
  navigation?: never;
}

export type MenuOption = MenuOptionWithNavigation | MenuOptionWithOnPress;

enum MenuModalState {
  ConfirmLogout = "confirmLogout",
  ProvideFeedback = "provideFeedback"
}

const feedbackLogger = log.extend( "feedback" );

function showOfflineAlert( t: ( _: string ) => string ) {
  Alert.alert( t( "You-are-offline" ), t( "Please-try-again-when-you-are-online" ) );
}

const Menu = ( ) => {
  const isDebug = zustandStorage.getItem( "debugMode" ) === "true";
  const realm = useRealm( );
  const navigation = useNavigation( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
  const { t } = useTranslation( );
  const insets = useSafeAreaInsets();

  const { isConnected } = useNetInfo( );

  const layoutPrefs = useLayoutPrefs();
  const [modalState, setModalState] = useState<MenuModalState | null>( null );

  const menuItems: Record<string, MenuOption> = {
    projects: {
      label: t( "PROJECTS" ),
      navigation: "Projects",
      icon: "briefcase",
    },
    about: {
      label: t( "ABOUT" ),
      navigation: "About",
      icon: "inaturalist",
    },
    donate: {
      label: t( "DONATE" ),
      navigation: "Donate",
      icon: "heart",
      color: colors.inatGreen,
    },
    help: {
      label: t( "HELP" ),
      navigation: "Help",
      icon: "help-circle",
    },
    settings: {
      testID: "settings",
      label: t( "SETTINGS" ),
      navigation: "Settings",
      icon: "gear",
    },

    feedback: {
      label: t( "FEEDBACK" ),
      icon: "feedback",
      onPress: () => {
        if ( isConnected ) {
          setModalState( MenuModalState.ProvideFeedback );
        } else {
          showOfflineAlert( t );
        }
      },
    },

    ...( currentUser
      ? {
        logout: {
          label: t( "LOG-OUT" ),
          icon: "door-exit",
          onPress: () => setModalState( MenuModalState.ConfirmLogout ),
          isLogout: true,
        },
      }
      : {
        login: {
          label: t( "LOG-IN" ),
          icon: "door-enter",
          color: colors.inatGreen,
          onPress: () => navigation.navigate( "LoginStackNavigator" ),
        },
      } ),

    ...( isDebug
      ? {
        debug: {
          label: "DEBUG",
          navigation: "Debug",
          icon: "triangle-exclamation",
          color: "deeppink",
        },
      }
      : {} ),
  };

  const onSignOut = async ( ) => {
    await signOut( { realm, clearRealm: true, queryClient } );
    setModalState( null );

    // TODO might be necessary to restart the app at this point. We just
    // deleted the realm file on disk, but the RealmProvider may still have a
    // copy of realm in local state
    navigation.goBack( );
  };

  const onSubmitFeedback = useCallback( ( feedbackText: string ) => {
    if ( !isConnected ) {
      showOfflineAlert( t );
      return false;
    }
    const locallySavedOnlyObservations = Observation.filterUnsyncedObservations( realm ).length;
    const getCountBreakpoint = ( count: number ) => valueToBreakpoint( count, [
      [0, "0"],
      [1, "1-9"],
      [10, "10-99"],
      [100, "100-999"],
      [1000, "1000+"],
    ] );
    const {
      isDefaultMode,
      isAllAddObsOptionsMode,
      screenAfterPhotoEvidence,
    } = layoutPrefs;
    const modeContext = ( isDefaultMode
      ? {
        mode: "default",
        observationButtonMode: "default",
        screenAfterPhotoEvidence: "default",
      }
      : {
        mode: "advanced",
        observationButtonMode: isAllAddObsOptionsMode
          ? "Obs Sheet"
          : "AI Camera",
        screenAfterPhotoEvidence,
      } );
    const loggedInContext = currentUser
      ? {
        loggedIn: "Yes",
        username: currentUser.login,
        userId: currentUser.id,
        identifications: typeof currentUser.identifications_count === "number"
          ? getCountBreakpoint( currentUser.identifications_count )
          : "NA",
        remoteObservations: typeof currentUser.observations_count === "number"
          ? getCountBreakpoint( currentUser.observations_count )
          : "NA",
      }
      : {
        loggedIn: "No",
        username: "loggedout",
        identifications: "loggedout",
        remoteObservations: "loggedout",
      };
    const feedbackContext = {
      ...modeContext,
      ...loggedInContext,
      // can have unsynced obs when logged out
      locallySavedOnlyObservations,
    };
    feedbackLogger.infoWithExtra( feedbackText, feedbackContext );
    Alert.alert( t( "Feedback-Submitted" ), t( "Thank-you-for-sharing-your-feedback" ) );
    setModalState( null );
    return true;
  }, [currentUser, isConnected, layoutPrefs, realm, t] );

  return (
    <ScrollView
      bounces={false}
      className="bg-white h-full"
      style={{ paddingTop: insets.top }}
    >
      <View>
        {/* Header */}
        <Pressable
          testID="menu-header"
          accessible
          accessibilityRole="button"
          accessibilityHint={
            currentUser
              ? t( "Navigates-to-user-profile" )
              : t( "Navigates-to-log-in-screen" )
          }
          className="px-[26px] pt-[68px] pb-[31px] border-b border-lightGray"
          onPress={( ) => {
            if ( !currentUser ) {
              navigation.navigate( "LoginStackNavigator" );
            } else {
              navigation.navigate( "TabNavigator", {
                screen: "ObservationsTab",
                params: {
                  screen: "UserProfile",
                  params: { userId: currentUser.id },
                },
              } );
            }
          }}
        >
          <View className="flex-row">
            {currentUser
              ? (
                <UserIcon
                  uri={User.uri( currentUser )}
                  medium
                />
              )
              : (
                <INatIcon
                  name="inaturalist"
                  color={colors.inatGreen}
                  size={62}
                />
              ) }
            <View className="ml-5 justify-center">
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
          </View>
        </Pressable>

        {/* Menu Items */}
        <View>
          {Object.entries( menuItems ).map( ( [key, item] ) => (
            <MenuItem
              key={key}
              item={item}
              onPress={() => {
                if ( item.navigation ) {
                  navigation.navigate( "TabNavigator", {
                    screen: "MenuTab",
                    params: {
                      screen: menuItems[key].navigation,
                    },
                  } );
                }
                item.onPress?.();
              }}
            />
          ) )}
        </View>
      </View>

      {modalState === MenuModalState.ConfirmLogout && (
        <WarningSheet
          onPressClose={() => setModalState( null )}
          headerText={t( "LOG-OUT--question" )}
          text={t( "Are-you-sure-you-want-to-log-out" )}
          handleSecondButtonPress={() => setModalState( null )}
          secondButtonText={t( "CANCEL" )}
          confirm={onSignOut}
          buttonText={t( "LOG-OUT" )}
          loading={false}
        />
      )}
      {modalState === MenuModalState.ProvideFeedback && (
        <TextInputSheet
          buttonText={t( "SUBMIT" )}
          onPressClose={() => setModalState( null )}
          headerText={t( "FEEDBACK" )}
          confirm={onSubmitFeedback}
          description={t( "Thanks-for-using-any-suggestions" )}
          maxLength={1000}
        />
      )}
    </ScrollView>
  );
};

export default Menu;
