// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import handleError from "api/error";
import colors from "colors";
import About from "components/About";
import CustomDrawerContent from "components/CustomDrawerContent";
import { getUserId, signOut } from "components/LoginSignUp/AuthenticationService";
import Login from "components/LoginSignUp/Login";
import NetworkLogging from "components/NetworkLogging";
import PlaceholderComponent from "components/PlaceholderComponent";
import Search from "components/Search/Search";
import Settings from "components/Settings/Settings";
import Mortal from "components/SharedComponents/Mortal";
import ObsEditProvider from "providers/ObsEditProvider";
import RealmProvider from "providers/RealmProvider";
import * as React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import IdentifyStackNavigation from "./identifyStackNavigation";
import MainStackNavigation from "./mainStackNavigation";
import ProjectsStackNavigation from "./projectsStackNavigation";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <View /> };
const hideHeader = {
  headerShown: false
};

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      retry: ( failureCount, error ) => {
        if (
          // If this is an actual 408 Request Timeout error, we probably want to
          // retry... but this will probably never happen
          error.status === 408
          // If there's just no network at the moment, definitely retry
          || ( error instanceof TypeError && error.message.match( "Network request failed" ) )
        ) return failureCount < 3;
        handleError( error, { throw: false } );
        return false;
      }
    }
  }
} );

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => <Mortal><Login /></Mortal>;

const Drawer = createDrawerNavigator( );

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.inatGreen,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    surface: colors.white
  }
};

const drawerRenderer = ( { state, navigation, descriptors } ) => (
  <CustomDrawerContent state={state} navigation={navigation} descriptors={descriptors} />
);

const App = ( ): React.Node => {
  React.useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      const userId = await getUserId( );
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = await AsyncStorage.getItem( "alreadyLaunched" );
      let deleteRealm = false;
      if ( !alreadyLaunched ) {
        deleteRealm = true;
        await AsyncStorage.setItem( "alreadyLaunched", "true" );
      }
      if ( !userId ) {
        await signOut( { deleteRealm } );
      }
    };

    checkForSignedInUser( );
  }, [] );

  return (
    <QueryClientProvider client={queryClient}>
      <RealmProvider>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <GestureHandlerRootView className="flex-1">
              <NavigationContainer>
                <ObsEditProvider>
                  <Drawer.Navigator
                    screenOptions={screenOptions}
                    name="Drawer"
                    drawerContent={drawerRenderer}
                  >
                    <Drawer.Screen
                      name="MainStack"
                      component={MainStackNavigation}
                      options={hideHeader}
                    />
                    <Drawer.Screen name="search" component={Search} />
                    <Drawer.Screen
                      name="identify"
                      component={IdentifyStackNavigation}
                      options={hideHeader}
                    />
                    <Drawer.Screen
                      name="projects"
                      component={ProjectsStackNavigation}
                      options={hideHeader}
                    />
                    <Drawer.Screen name="settings" component={Settings} options={hideHeader} />
                    <Drawer.Screen
                      name="about"
                      component={About}
                    />
                    <Drawer.Screen name="help" component={PlaceholderComponent} />
                    <Drawer.Screen name="login" component={MortalLogin} options={hideHeader} />
                    <Drawer.Screen
                      name="network"
                      component={NetworkLogging}
                    />
                  </Drawer.Navigator>
                </ObsEditProvider>
              </NavigationContainer>
            </GestureHandlerRootView>
          </PaperProvider>
        </SafeAreaProvider>
      </RealmProvider>
    </QueryClientProvider>
  );
};

export default App;
