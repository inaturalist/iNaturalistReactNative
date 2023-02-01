// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { screen, waitFor } from "@testing-library/react-native";
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

  // For some reason this interferes with the "should not make a request to
  // users/me" test below, can't figure out why ~~~kueda 20230105
  // describe( "accessibility", ( ) => {
  //   it( "should not have accessibility errors", async ( ) => {
  //     const mockUser = factory( "LocalUser" );
  //     await signIn( mockUser );
  //     const observations = [factory( "RemoteObservation" )];
  //     inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
  //     renderAppWithComponent( <ObsList /> );
  //     const { findByTestId } = renderAppWithComponent( <ObsList /> );
  //     expect( await screen.findByTestId( "ObservationViews.myObservations" ) ).toBeAccessible( );
  //   } );
  // } );

  describe( "when signed out", ( ) => {
    async function testApiMethodNotCalled( apiMethod ) {
      // Let's make sure the mock hasn't already been used
      expect( apiMethod ).not.toHaveBeenCalled( );
      const signedInUsers = global.realm.objects( "User" ).filtered( "signedIn == true" );
      expect( signedInUsers.length ).toEqual( 0 );
      renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( screen.getByText( "Log in to iNaturalist" ) ).toBeTruthy( );
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

  describe.skip( "localization for current user", ( ) => {
    it( "should be English by default", async ( ) => {
      const mockUser = factory( "LocalUser" );
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser );
      renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( screen.getByText( / Observations/ ) ).toBeTruthy( );
      } );
      expect( screen.queryByText( /X-Observations/ ) ).toBeFalsy( );
    } );

    it( "should be Spanish if signed in user's locale is Spanish", async ( ) => {
      const mockSpanishUser = factory( "LocalUser", {
        locale: "es"
      } );
      expect( mockSpanishUser.locale ).toEqual( "es" );
      await signIn( mockSpanishUser );
      renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( screen.getByText( / Observaciones/ ) ).toBeTruthy();
      } );
      expect( screen.queryByText( /X-Observations/ ) ).toBeFalsy( );
    } );

    it(
      "should change to es when local user locale is en but remote user locale is es",
      async ( ) => {
        const mockUser = factory( "LocalUser" );
        expect( mockUser.locale ).toEqual( "en" );
        await signIn( mockUser );

        const mockSpanishUser = factory( "LocalUser", {
          locale: "es"
        } );
        inatjs.users.me.mockResolvedValue( makeResponse( [mockSpanishUser] ) );

        renderAppWithComponent( <ObsList /> );
        // I'd prefer to wait for the Spanish text to appear, but that never
        // seems to wait long enough. This waits for the relevant API call to
        // have been made
        await waitFor( ( ) => {
          expect( inatjs.users.me ).toHaveBeenCalled( );
        } );
        expect( await screen.findByText( / Observaciones/ ) ).toBeTruthy( );
        expect( screen.queryByText( /X-Observations/ ) ).toBeFalsy( );
      }
    );
  } );
} );
