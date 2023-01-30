import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import App from "components/App";
import React from "react";

const Drawer = createDrawerNavigator( );

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
      <NavigationContainer>
        { component }
      </NavigationContainer>
    </QueryClientProvider>
  );
}

function renderScreen( component, name, update ) {
  return renderComponent(
    <Drawer.Navigator>
      <Drawer.Screen component={component} name={name} />
    </Drawer.Navigator>,
    update
  );
}

function renderAppWithComponent( component, update = null ) {
  return renderComponent( <App>{ component }</App>, update );
}

export {
  renderAppWithComponent,
  renderComponent,
  renderScreen
};
