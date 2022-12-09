import { NavigationContainer, useRoute } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Observation from "realmModels/Observation";

import factory from "../factory";

jest.useFakeTimers( );

// mock Portal with a Modal component inside of it (MediaViewer)
jest.mock( "react-native-paper", () => {
  const RealModule = jest.requireActual( "react-native-paper" );
  const MockedModule = {
    ...RealModule,
    // eslint-disable-next-line react/jsx-no-useless-fragment
    Portal: ( { children } ) => <>{children}</>
  };
  return MockedModule;
} );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: jest.fn( ( ) => ( { } ) ),
    useNavigation: ( ) => ( {
      setOptions: jest.fn( )
    } )
  };
} );

const queryClient = new QueryClient( );

const renderObsEdit = ( update = null ) => {
  const renderMethod = update || render;
  return renderMethod(
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <ObsEditProvider>
            <ObsEdit />
          </ObsEditProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

describe( "UUID in params", ( ) => {
  it( "should set the observation in context when context is blank", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    const { queryByText } = renderObsEdit( );
    await waitFor( ( ) => {
      expect( queryByText( observation.taxon.name ) ).toBeTruthy( );
    } );
  } );

  // I don't love this approach. What I want to do is assert that the context
  // has the value I expect it has, but I don't see a way to do that without
  // mocking the entirety of ObsEditProvider, which I don't want to do
  // because that's one of the systems under test here
  it( "should render the observation in params after viewing other observation", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    const { queryByText, update } = renderObsEdit( );
    await waitFor( async ( ) => {
      expect( queryByText( observation.taxon.name ) ).toBeTruthy( );
      // Up to this point we're just repeating the prior test to ensure that the
      // observation in the params gets inserted into the context

      // Now we alter the params so they specify a different observation
      const newObservation = await Observation.saveLocalObservationForUpload(
        factory( "LocalObservation" ),
        global.realm
      );
      useRoute.mockImplementation( ( ) => ( { params: { uuid: newObservation.uuid } } ) );
      await renderObsEdit( update );
      expect( queryByText( newObservation.taxon.name ) ).toBeTruthy( );
      expect( queryByText( observation.taxon.name ) ).toBeFalsy( );
    } );
  } );

  it( "should not reset the observation in context when context has "
      + "the same observation", async ( ) => {
    const observation = await Observation.saveLocalObservationForUpload(
      factory( "LocalObservation" ),
      global.realm
    );
    useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
    const { queryByText, update } = renderObsEdit( );
    await waitFor( async ( ) => {
      expect( queryByText( observation.taxon.name ) ).toBeTruthy( );
      useRoute.mockImplementation( ( ) => ( { params: { uuid: observation.uuid } } ) );
      await renderObsEdit( update );
      expect( queryByText( observation.taxon.name ) ).toBeTruthy( );
    } );
  } );
} );
