// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { NavigationContainer } from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react-native";
import ObsList from "components/Observations/ObsList";
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
      <ObsList />
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
// test( "only makes one concurrent request for observations at a time", async( ) => {
//   const observations = [factory( "RemoteObservation" )];
//   inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
//   await waitFor( ( ) => render( <NavigationContainer><ObsList /></NavigationContainer> ) );
//   // this doesn't pass b/c useObservations() gets called a lot; we
//   // probably need a way to ensure that only one request is in flight at a
//   // time
//   expect( inatjs.observations.search.mock.calls.length ).toEqual( 1 );
// } );

test( "should not have accessibility errors", async ( ) => {
  const observations = [factory( "RemoteObservation" )];
  inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  const { getByTestId } = await waitFor( ( ) => renderObsList( ) );
  const obsList = getByTestId( "ObservationViews.myObservations" );
  expect( obsList ).toBeAccessible( );
} );

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => {
    console.log( "returning mock user" );
    return mockUser;
  }
} ) );

describe( "localization for current user", ( ) => {
  // we should be rendering App.js but haven't gotten that working yet
  const signInUser = async user => {
    await RNSInfo.setItem( "username", user.login );
    inatjs.users.fetch.mockResolvedValue( makeResponse( [user] ) );
  };

  it( "should be english by default", async ( ) => {
    signInUser( mockUser );
    const { findByText } = renderObsList( );
    const observationText = await findByText( /Observations/ );
    // console.log( observationText, "obs text" );
    expect( observationText ).toBeTruthy( );
  } );

  it.todo( "should be spanish if signed in user's locale is spanish" );
} );
