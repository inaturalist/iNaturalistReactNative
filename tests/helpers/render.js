import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import App from "components/App";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import Observation from "realmModels/Observation";

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      // No need to do default retries in tests
      retry: false,
      // Prevent `Jest did not exit one second after the test run has completed.` error
      // https://react-query-v3.tanstack.com/guides/testing#set-cachetime-to-infinity-with-jest
      cacheTime: Infinity
    }
  }
} );

function renderComponent( component, update = null ) {
  const renderMethod = update || render;
  return renderMethod(
    <QueryClientProvider client={queryClient}>
      <INatPaperProvider>
        <BottomSheetModalProvider>
          <NavigationContainer>
            { component }
          </NavigationContainer>
        </BottomSheetModalProvider>
      </INatPaperProvider>
    </QueryClientProvider>
  );
}

function renderAppWithComponent( component, update = null ) {
  return renderComponent( <App>{ component }</App>, update );
}

async function renderObservationsStackNavigatorWithObservations(
  observations: Array,
  realmIdentifier: string
): any {
  // Save the mock observation in Realm
  await Observation.saveLocalObservationForUpload(
    observations[0],
    global.mockRealms[realmIdentifier]
  );
  renderComponent(
    <ObservationsStackNavigator />
  );
}

export {
  renderAppWithComponent,
  renderComponent,
  renderObservationsStackNavigatorWithObservations
};
