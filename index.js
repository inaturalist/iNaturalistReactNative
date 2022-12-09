// @flow

import "i18n";

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import handleError from "api/error";
import App from "components/App";
import inatjs from "inaturalistjs";
import ObsEditProvider from "providers/ObsEditProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { AppRegistry } from "react-native";
import Config from "react-native-config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startNetworkLogging } from "react-native-network-logger";
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

import { name as appName } from "./app.json";

startNetworkLogging();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

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

// TODO: remove paper themes from app in favor of Tailwind
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

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <GestureHandlerRootView className="flex-1">
            {/* NavigationContainer needs to be nested above ObsEditProvider */}
            <NavigationContainer>
              <ObsEditProvider>
                <App />
              </ObsEditProvider>
            </NavigationContainer>
          </GestureHandlerRootView>
        </PaperProvider>
      </SafeAreaProvider>
    </RealmProvider>
  </QueryClientProvider>
);

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
