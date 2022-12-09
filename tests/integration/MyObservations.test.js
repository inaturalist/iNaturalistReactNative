// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";
import App from "components/App";
import ObsList from "components/Observations/ObsList";
import inatjs from "inaturalistjs";
import React from "react";
import RNSInfo from "react-native-sensitive-info";

import factory, { makeResponse } from "../factory";

jest.useFakeTimers( );

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        name: ""
      }
    } )
  };
} );

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

const renderObsList = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <App><ObsList /></App>
    </NavigationContainer>
  </QueryClientProvider>
);

const signInUser = async user => {
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", "yaddayadda" );
  await RNSInfo.setItem( "accessToken", "yaddayadda" );
  inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  user.signedIn = true;
  global.realm.write( ( ) => {
    global.realm.create( "User", user, "modified" );
  } );
};

it( "should not have accessibility errors", async ( ) => {
  const mockUser = factory( "LocalUser" );
  await signInUser( mockUser );
  const observations = [factory( "RemoteObservation" )];
  inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  const { queryByTestId } = renderObsList( );
  await waitFor( ( ) => {
    expect( queryByTestId( "ObservationViews.myObservations" ) ).toBeAccessible( );
  } );
} );

describe( "localization for current user", ( ) => {
  it( "should be english by default", async ( ) => {
    const mockUser = factory( "LocalUser" );
    expect( mockUser.locale ).toEqual( "en" );
    await signInUser( mockUser );
    const { queryByText } = renderObsList( );
    await waitFor( ( ) => {
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
      expect( queryByText( /Observations/ ) ).toBeTruthy( );
    } );
  } );

  it( "should be spanish if signed in user's locale is spanish", async ( ) => {
    const mockSpanishUser = factory( "LocalUser", {
      locale: "es"
    } );
    await signInUser( mockSpanishUser );
    const { queryByText } = renderObsList( );
    waitFor( ( ) => {
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
      expect( queryByText( /Observaciones/ ) ).toBeTruthy( );
    } );
  } );
} );
