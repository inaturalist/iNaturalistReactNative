// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { waitFor } from "@testing-library/react-native";
import ObsList from "components/Observations/ObsList";
import inatjs from "inaturalistjs";
import React from "react";

// import RNSInfo from "react-native-sensitive-info";
import factory, { makeResponse } from "../factory";
import { renderAppWithComponent } from "../helpers/render";
import { signIn, signOut } from "../helpers/user";

jest.useFakeTimers( );

describe( "MyObservations", ( ) => {
  beforeEach( signOut );

  afterEach( ( ) => {
    jest.clearAllMocks( );
  } );

  it( "should not have accessibility errors", async ( ) => {
    const mockUser = factory( "LocalUser" );
    await signIn( mockUser );
    const observations = [factory( "RemoteObservation" )];
    inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
    const { queryByTestId } = renderAppWithComponent( <ObsList /> );
    await waitFor( ( ) => {
      expect( queryByTestId( "ObservationViews.myObservations" ) ).toBeAccessible( );
    } );
  } );

  describe( "when signed out", ( ) => {
    async function testApiMethodNotCalled( apiMethod ) {
      const signedInUsers = global.realm.objects( "User" ).filtered( "signedIn == true" );
      expect( signedInUsers.length ).toEqual( 0 );
      const { getByText } = renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( getByText( "Log in to iNaturalist" ) ).toBeTruthy( );
      } );
      // Unpleasant, but without adjusting the timeout it doesn't seem like
      // all of these requests get caught
      await waitFor( ( ) => {
        expect( apiMethod ).not.toHaveBeenCalled( );
      }, { timeout: 3000, interval: 500 } );
    }
    it( "should not make a request to users/me", async ( ) => {
      await testApiMethodNotCalled( inatjs.users.me );
    } );
    it( "should not make a request to observations/updates", async ( ) => {
      await testApiMethodNotCalled( inatjs.observations.updates );
    } );
  } );

  describe( "localization for current user", ( ) => {
    it( "should be English by default", async ( ) => {
      const mockUser = factory( "LocalUser" );
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser );
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
      await signIn( mockSpanishUser );
      const { queryByText } = renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
        expect( queryByText( / Observaciones/ ) ).toBeTruthy( );
      } );
    } );
    it.todo( "should change to es when local user locale is en but remote user locale is es" );
  } );
} );
