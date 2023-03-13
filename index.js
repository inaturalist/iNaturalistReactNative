// @flow

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import handleError from "api/error";
import App from "components/App";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { AppRegistry } from "react-native";
import Config from "react-native-config";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UploadProgressProvider } from "sharedHooks/useUploadProgress";

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

initI18next();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL
} );

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      retry: async ( failureCount, error ) => {
        if (
          // If this is an actual 408 Request Timeout error, we probably want to
          // retry... but this will probably never happen
          error.status === 408
          // If there's just no network at the moment, definitely retry
          || ( error instanceof TypeError && error.message.match( "Network request failed" ) )
        ) return failureCount < 3;
        handleError( error, { throw: false } );
        if ( error.status === 401 || error.status === 403 ) {
          // If we get a 401 or 403, call getJWT
          // which has a timestamp check if we need to refresh the token
          const token = await getJWT( );
          if ( token ) return failureCount < 2;
        }
        return false;
      }
    }
  }
} );

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <INatPaperProvider>
          <GestureHandlerRootView className="flex-1">
            {/* NavigationContainer needs to be nested above ObsEditProvider */}
            <NavigationContainer>
              <UploadProgressProvider>
                <ObsEditProvider>
                  <App />
                </ObsEditProvider>
              </UploadProgressProvider>
            </NavigationContainer>
          </GestureHandlerRootView>
        </INatPaperProvider>
      </SafeAreaProvider>
    </RealmProvider>
  </QueryClientProvider>
);

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
