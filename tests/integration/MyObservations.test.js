// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { waitFor } from "@testing-library/react-native";
import ObsList from "components/Observations/ObsList";
import inatjs from "inaturalistjs";
import React from "react";

// import RNSInfo from "react-native-sensitive-info";
import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";
import { signInUser } from "../helpers/user";

jest.useFakeTimers( );

beforeEach( ( ) => {
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
} );

it( "should not have accessibility errors", async ( ) => {
  const mockUser = factory( "LocalUser" );
  await signInUser( mockUser );
  const observations = [factory( "RemoteObservation" )];
  inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  const { queryByTestId } = renderAppWithComponent( <ObsList /> );
  await waitFor( ( ) => {
    expect( queryByTestId( "ObservationViews.myObservations" ) ).toBeAccessible( );
  } );
} );

describe( "localization for current user", ( ) => {
  it( "should be English by default", async ( ) => {
    const mockUser = factory( "LocalUser" );
    expect( mockUser.locale ).toEqual( "en" );
    await signInUser( mockUser );
    const { queryByText } = renderAppWithComponent( <ObsList /> );
    await waitFor( ( ) => {
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
      expect( queryByText( / Observations/ ) ).toBeTruthy( );
    } );
  } );

  it( "should be Spanish if signed in user's locale is Spanish", async ( ) => {
    const mockSpanishUser = factory( "LocalUser", {
      locale: "es"
    } );
    expect( mockSpanishUser.locale ).toEqual( "es" );
    await signInUser( mockSpanishUser );
    const { queryByText } = renderAppWithComponent( <ObsList /> );
    await waitFor( ( ) => {
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
      expect( queryByText( / Observaciones/ ) ).toBeTruthy( );
    } );
  } );
  it.todo( "should change to es when local user locale is en but remote user locale is es" );
} );
