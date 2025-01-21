// @flow

// React Native doesn't have a functional URL as of Feb 2024
import "react-native-url-polyfill/auto";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import App from "components/App";
import ErrorBoundary from "components/ErrorBoundary";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import OfflineNavigationGuard from "navigation/OfflineNavigationGuard.tsx";
import INatPaperProvider from "providers/INatPaperProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import { Alert, AppRegistry } from "react-native";
import Config from "react-native-config";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { startNetworkLogging } from "react-native-network-logger";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getInstallID } from "sharedHelpers/installData.ts";
import { reactQueryRetry } from "sharedHelpers/logging";

import { name as appName } from "./app.json";
import { log } from "./react-native-logs.config";
import { getUserAgent } from "./src/api/userAgent";

const logger = log.extend( "index.js" );

// Log all unhandled promise rejections in release builds. Otherwise they will
// die in silence. Debug builds have a more useful UI w/ desymbolicated stack
// traces
/* eslint-disable no-undef */
if (
  !__DEV__
  && typeof (
    // $FlowIgnore
    HermesInternal?.enablePromiseRejectionTracker === "function"
  )
) {
  // $FlowIgnore
  HermesInternal.enablePromiseRejectionTracker( {
    allRejections: true,
    onUnhandled: ( id, error ) => {
      logger.error( "Unhandled promise rejection: ", error );
    }
  } );
}
/* eslint-enable no-undef */

// I'm not convinced this ever catches anything... ~~~kueda 20240110
const jsErrorHandler = ( e, isFatal ) => {
  if ( e?.message?.match( /No space left on device/ ) ) {
    Alert.alert(
      "Device-storage-full",
      "iNaturalist may not be able to save your photos or may crash.",
      [{ text: t( "OK" ) }]
    );
  }

  // not 100% sure why jsErrorHandler logs e.name and e.message as undefined sometimes,
  // but I believe it relates to this issue, which reports an unnecessary console.error
  // under the hood: https://github.com/a7ul/react-native-exception-handler/issues/143

  // possibly also related to error boundaries in React 16+:
  // https://github.com/a7ul/react-native-exception-handler/issues/60
  // if ( !e.name && !e.message ) return;
  if ( isFatal ) {
    logger.error( "Fatal JS Error: ", e );
    Alert.alert( "D'OH", `${e.message}\n\n${e.stack}` );
  } else {
    // This should get logged by ErrorBoundary. For some reason this handler
    // gets called too, so we don't want to double-report errors
  }
};

// record JS exceptions; second parameter allows this to work in DEV mode
setJSExceptionHandler( jsErrorHandler, true );

// record native exceptions
// only works in bundled mode; will show red screen in dev mode
// tested this by raising an exception in RNGestureHandler.m
// https://stackoverflow.com/questions/63270492/how-to-raise-native-error-in-react-native-app
// https://github.com/a7ul/react-native-exception-handler#react-native-navigation-wix
setNativeExceptionHandler( exceptionString => {
  logger.error( `Native Error: ${exceptionString}` );
}, false );

// Only in debug builds
// eslint-disable-next-line no-undef
if ( __DEV__ ) {
  startNetworkLogging();
}

initI18next();

// Configure inatjs to use the chosen URLs
inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL,
  userAgent: getUserAgent(),
  headers: {
    "X-Installation-ID": getInstallID( )
  }
} );

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      retry: reactQueryRetry
    }
  }
} );

const AppWithProviders = ( ) => (
  <QueryClientProvider client={queryClient}>
    <RealmProvider>
      <SafeAreaProvider>
        <INatPaperProvider>
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              <OfflineNavigationGuard>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </OfflineNavigationGuard>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </INatPaperProvider>
      </SafeAreaProvider>
    </RealmProvider>
  </QueryClientProvider>

);

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
