// @flow

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";

import { signOut, getUserId } from "../components/LoginSignUp/AuthenticationService";
import PlaceholderComponent from "../components/PlaceholderComponent";
import MyObservationsStackNavigator from "./myObservationsStackNavigation";
import ExploreStackNavigator from "./exploreStackNavigation";
import Search from "../components/Search/Search";
import Login from "../components/LoginSignUp/Login";
import ProjectsStackNavigation from "./projectsStackNavigation";
import CameraStackNavigation from "./cameraStackNavigation";
import CustomDrawerContent from "../components/CustomDrawerContent";
import IdentifyStackNavigation from "./identifyStackNavigation";
import ObsEditProvider from "../providers/ObsEditProvider";
import NetworkLogging from "../components/NetworkLogging";
import NotificationsStackNavigation from "./notificationsStackNavigation";
import About from "../components/About";
import Mortal from "../components/SharedComponents/Mortal";
import PhotoGalleryProvider from "../providers/PhotoGalleryProvider";
import { colors } from "../styles/global";
import { viewStyles } from "../styles/navigation/rootNavigation";
import Settings from "../components/Settings/Settings";

// this removes the default hamburger menu from header
const screenOptions = { headerLeft: ( ) => <></> };
const hideHeader = {
  headerShown: false,
  label: "my observations"
};

// The login component should be not preserve its state or effects after the
// user navigates away from it. This will simply cause it to unmount when it
// loses focus
const MortalLogin = ( ) => <Mortal><Login /></Mortal>;

const Drawer = createDrawerNavigator( );

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.lightGray,
    accent: colors.inatGreen,
    surface: colors.white
  }
};

const App = ( ): React.Node => {
  React.useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      const userId = await getUserId( );
      if ( !userId ) {
        await signOut( );
      }
    };

    checkForSignedInUser( );
  }, [] );

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={viewStyles.container}>
        <NavigationContainer>
          <PhotoGalleryProvider>
            <ObsEditProvider>
              <Drawer.Navigator
                screenOptions={screenOptions}
                name="Drawer"
                drawerContent={( props ) => <CustomDrawerContent {...props} />}
              >
                <Drawer.Screen
                  name="my observations"
                  component={MyObservationsStackNavigator}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="notifications"
                  component={NotificationsStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="identify"
                  component={IdentifyStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen name="search" component={Search} />
                <Drawer.Screen
                  name="projects"
                  component={ProjectsStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen name="settings" component={Settings} options={hideHeader} />
                <Drawer.Screen name="following (dashboard)" component={PlaceholderComponent} />
                <Drawer.Screen
                  name="about"
                  component={About}
                />
                <Drawer.Screen name="help/tutorials" component={PlaceholderComponent} />
                <Drawer.Screen name="login" component={MortalLogin} options={hideHeader}/>
                <Drawer.Screen
                  name="camera"
                  component={CameraStackNavigation}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="explore stack"
                  component={ExploreStackNavigator}
                  options={hideHeader}
                />
                <Drawer.Screen
                  name="network"
                  component={NetworkLogging}
                />
              </Drawer.Navigator>
            </ObsEditProvider>
          </PhotoGalleryProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

export default App;
