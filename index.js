// @flow

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import App from "components/App";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import INatPaperProvider from "providers/INatPaperProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { AppRegistry } from "react-native";
import Config from "react-native-config";
// eslint-disable-next-line import/no-extraneous-dependencies
import ErrorBoundary from "react-native-error-boundary";
import { setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableLatestRenderer } from "react-native-maps";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { reactQueryRetry } from "sharedHelpers/logging";

import { name as appName } from "./app.json";
import { log } from "./react-native-logs.config";

enableLatestRenderer( );

const logger = log.extend( "index.js" );

// record native exceptions
// only works in bundled mode; will show red screen in dev mode
// tested this by raising an exception in RNGestureHandler.m
// https://stackoverflow.com/questions/63270492/how-to-raise-native-error-in-react-native-app
setNativeExceptionHandler( exceptionString => {
  logger.error( `Native Error: ${exceptionString}` );
} );

startNetworkLogging();

initI18next();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      retry: reactQueryRetry
    }
  }
} );

const errorHandler = ( error: Error, stackTrace: string ) => {
  if ( error ) {
    logger.error( `ErrorBoundary: ${error.toString( )} ${stackTrace}` );
  }
};

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <INatPaperProvider>
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              {/* NavigationContainer needs to be nested above ObsEditProvider */}
              <NavigationContainer>
                <ErrorBoundary onError={errorHandler}>
                  <App />
                </ErrorBoundary>
              </NavigationContainer>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </INatPaperProvider>
      </SafeAreaProvider>
    </RealmProvider>
  </QueryClientProvider>

);

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
