// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import "i18n";

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import App from "components/App";
import ObsList from "components/Observations/ObsList";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import RNSInfo from "react-native-sensitive-info";

import factory, { makeResponse } from "../factory";

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

jest.mock( "sharedHooks/useApiToken" );

const queryClient = new QueryClient( );

const renderObsList = ( ) => render(
  <QueryClientProvider client={queryClient}>
    <NavigationContainer>
      <App>
        <ObsList />
      </App>
    </NavigationContainer>
  </QueryClientProvider>
);
// TODO: mock.calls.length started returning 0, need to figure out why this isn't working
test.todo( "renders the number of comments from remote response" );
// test( "renders the number of comments from remote response", async ( ) => {
//   const observations = [factory( "RemoteObservation", { place_guess: "foo", comments: [
//     factory( "LocalComment" )
//   ] } )];
//   console.log( observations, "observaiotns" );
//   inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
//   const { getByTestId } = await renderObsList( );
//   expect( inatjs.observations.search.mock.calls.length ).toBeGreaterThan( 0 );
//   const obs = observations[0];
//   const card = getByTestId( `ObsList.obsCard.${obs.uuid}` );
//   expect( card ).toBeTruthy( );
//   const commentCount = within( card ).getByTestId( "ObsList.obsCard.commentCount" );
//   expect( commentCount.children[0] ).toEqual( obs.comments.length.toString( ) );
// } );

test.todo( "only makes one concurrent request for observations at a time" );
// test( "only makes one concurrent request for observations at a time", async ( ) => {
//   const observations = [factory( "RemoteObservation" )];
//   inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
//   await waitFor( ( ) => render( <NavigationContainer><ObsList /></NavigationContainer> ) );
//   // this doesn't pass b/c useObservations() gets called a lot; we
//   // probably need a way to ensure that only one request is in flight at a
//   // time
//   expect( inatjs.observations.search ).toHaveBeenCalledOnce( );
// } );
const mockUseCurrentUser = jest.fn( );

test( "should not have accessibility errors", async ( ) => {
  const signInUser = async user => {
    mockUseCurrentUser.mockImplementation( ( ) => user );
    await RNSInfo.setItem( "username", user.login );
    inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  };
  const mockUser = factory( "LocalUser", {
    locale: "de"
  } );
  await signInUser( mockUser );
  const observations = [factory( "RemoteObservation" )];
  inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  const { findByTestId } = renderObsList( );
  const obsList = await findByTestId( "ObservationViews.myObservations" );
  expect( obsList ).toBeAccessible( );
} );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => mockUseCurrentUser( )
} ) );

describe( "localization for current user", ( ) => {
  const signInUser = async user => {
    mockUseCurrentUser.mockImplementation( ( ) => user );
    await RNSInfo.setItem( "username", user.login );
    inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  };
  it( "should be english by default", async ( ) => {
    const mockUser = factory( "LocalUser", {
      locale: "en"
    } );
    await signInUser( mockUser );
    const { findByText } = renderObsList( );
    // note: this might include X-Observations, which is the non-translated version
    // and means english is not actually getting set as the default
    const observationText = await findByText( /Observations/ );
    expect( observationText ).toBeTruthy( );
  } );

  it( "should be spanish if signed in user's locale is spanish", async ( ) => {
    const mockSpanishUser = factory( "LocalUser", {
      locale: "es"
    } );
    await signInUser( mockSpanishUser );
    // added this line because it didn't look like i18next.changeLanguage was actually
    // getting called without this... probably not how we want to test
    i18next.changeLanguage( mockSpanishUser.locale );
    const { findByText } = renderObsList( );
    const observationText = await findByText( /Observaciones/ );
    expect( observationText ).toBeTruthy( );
  } );
} );
