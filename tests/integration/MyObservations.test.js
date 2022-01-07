// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import React from "react";
import factory, { makeResponse } from "../factory";
import { render, waitFor, within } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AccessibilityEngine from "react-native-accessibility-engine";

import ObsList from "../../src/components/Observations/ObsList";
import ObservationProvider from "../../src/providers/ObservationProvider";

// Mock inaturalistjs so we can make some fake responses
jest.mock( "inaturalistjs" );
import inatjs from "inaturalistjs";

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

const renderObsList = async ( ) => waitFor(
  ( ) => render(
    <NavigationContainer>
      <ObservationProvider>
        <ObsList />
      </ObservationProvider>
    </NavigationContainer>
  )
);

test( "renders the number of comments from remote response", async ( ) => {
  const observations = [factory( "RemoteObservation", { place_guess: "foo", comments: [
    factory( "LocalComment" )
  ] } )];
  inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  const { getByTestId } = await renderObsList( );
  expect( inatjs.observations.search.mock.calls.length ).toBeGreaterThan( 0 );
  const obs = observations[0];
  const card = getByTestId( `ObsList.obsCard.${obs.uuid}` );
  expect( card ).toBeTruthy( );
  const commentCount = within( card ).getByTestId( "ObsList.obsCard.commentCount" );
  expect( commentCount.children[0] ).toEqual( obs.comments.length.toString( ) );
} );

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
  const { getByTestId } = await renderObsList( );
  const obsList = getByTestId( "ObsList.myObservations" );
  expect( ( ) => AccessibilityEngine.check( obsList ) ).not.toThrow();
} );
