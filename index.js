// @flow

import "i18n";

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import handleError from "api/error";
import App from "components/App";
import INatIcon from "components/INatIcon";
import inatjs from "inaturalistjs";
import ObsEditProvider from "providers/ObsEditProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { AppRegistry } from "react-native";
import Config from "react-native-config";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startNetworkLogging } from "react-native-network-logger";
import { MD3LightTheme as DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import colors from "styles/tailwindColors";

import { name as appName } from "./app.json";
import { log } from "./react-native-logs.config";

const logger = log.extend( "index.js" );

const jsErrorHandler = ( e, isFatal ) => {
  // not 100% sure why jsErrorHandler logs e.name and e.message as undefined sometimes,
  // but I believe it relates to this issue, which reports an unnecessary console.error
  // under the hood: https://github.com/a7ul/react-native-exception-handler/issues/143

  // possibly also related to error boundaries in React 16+:
  // https://github.com/a7ul/react-native-exception-handler/issues/60
  if ( !e.name && !e.message ) return;
  logger.error( `JS Error: ${isFatal ? "Fatal:" : ""} ${e.stack}` );
};

// record JS exceptions; second parameter allows this to work in DEV mode
setJSExceptionHandler( jsErrorHandler, true );

// record native exceptions
// only works in bundled mode; will show red screen in dev mode
// tested this by raising an exception in RNGestureHandler.m
// https://stackoverflow.com/questions/63270492/how-to-raise-native-error-in-react-native-app
setNativeExceptionHandler( exceptionString => {
  logger.error( `Native Error: ${exceptionString}` );
} );

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
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.darkGray,
    onPrimary: colors.white,
    secondary: colors.focusGreen,
    onSecondary: colors.white,
    background: colors.white,
    error: colors.warningRed,
    onError: colors.white
  }
};

// eslint-disable-next-line react/jsx-props-no-spreading
const renderCustomIcon = props => <INatIcon {...props} />;

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <PaperProvider
          settings={{
            icon: renderCustomIcon
          }}
          theme={theme}
        >
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
