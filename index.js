// @flow

// Recommendation from the uuid library is to import get-random-values before
// uuid, so we're importing it first thing in the entry point.
// https://www.npmjs.com/package/uuid#react-native--expo
// eslint-disable-next-line simple-import-sort/imports
import "react-native-get-random-values";

// React Native doesn't have a functional URL as of Feb 2024
import "react-native-url-polyfill/auto";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  useColorScheme, Alert, AppRegistry, View
} from "react-native";
import { getCurrentRoute } from "navigation/navigationUtils";
import { zustandStorage } from "stores/useStore";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import App from "components/App";
import ErrorBoundary from "components/ErrorBoundary";
import initI18next from "i18n/initI18next";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import OfflineNavigationGuard from "navigation/OfflineNavigationGuard";
import INatPaperProvider from "providers/INatPaperProvider";
import RealmProvider from "providers/RealmProvider";
import React from "react";
import Config from "react-native-config";
import { setJSExceptionHandler, setNativeExceptionHandler } from "react-native-exception-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getInstallID } from "sharedHelpers/installData";
import { reactQueryRetry } from "sharedHelpers/logging";
import DeviceInfo from "react-native-device-info";

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
    Alert.alert( "Fatal JS Error", `${e.message}\n\n${e.stack}` );
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
setNativeExceptionHandler(
  async exceptionString => {
    try {
      const crashData = {
        error: exceptionString,
        screen: getCurrentRoute()?.name || "",
        memoryUsage: await DeviceInfo.getUsedMemory(),
        timestamp: new Date().toISOString(),
        appVersion: await DeviceInfo.getVersion()
      };

      // Store crash data for retrieval on next app launch
      zustandStorage.setItem( "LAST_CRASH_DATA", JSON.stringify( crashData ) );

      logger.error( `Native Error: ${exceptionString}`, JSON.stringify( crashData ) );
    } catch ( e ) {
      // Last-ditch attempt to log something
      logger.error( `Native Error: ${exceptionString} (failed to save context)`, e );
    }
  },
  true, // Force quit the app to prevent zombie states
  true // Enable on iOS
);

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

const AppWithProviders = ( ) => {
  const colorScheme = useColorScheme( );
  const darkModeStyleWrapper = { flex: 1, colorScheme };

  return (
    <QueryClientProvider client={queryClient}>
      <RealmProvider>
        <INatPaperProvider>
          <GestureHandlerRootView className="flex-1">
            <BottomSheetModalProvider>
              <SafeAreaProvider>
                <View style={darkModeStyleWrapper}>
                  <OfflineNavigationGuard>
                    <ErrorBoundary>
                      <App />
                    </ErrorBoundary>
                  </OfflineNavigationGuard>
                </View>
              </SafeAreaProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </INatPaperProvider>
      </RealmProvider>
    </QueryClientProvider>
  );
};

AppRegistry.registerComponent( appName, ( ) => AppWithProviders );
