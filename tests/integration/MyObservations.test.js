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

jest.useFakeTimers();

jest.mock( "i18next", () => {
  const originalModule = jest.requireActual( "i18next" );

  return {
    // Ideally we shouldn't have to test i18next itself
    // just need to test that the correct keys/opts are being fed to i18next
    t: ( key, options ) => {
      if ( !options ) {
        return key;
      }
      return originalModule.t( key, options );
    }
  };
} );

describe( "MyObservations", () => {
  beforeEach( signOut );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  // Hacky solution, but making the test for signed out users first
  // signIn has some side-effects that aren't getting properly cleaned up
  // Users persist somehow while the test is running, despite being removed
  // from the global realm instance
  describe( "when signed out", () => {
    async function testApiMethodNotCalled( apiMethod, realm ) {
      const signedInUsers = realm.objects( "User" );
      expect( signedInUsers.length ).toEqual( 0 );

      const { getByText } = renderAppWithComponent( <ObsList /> );
      await waitFor( () => {
        expect( getByText( "Log-in-to-iNaturalist" ) ).toBeTruthy();
      } );
      // Unpleasant, but without adjusting the timeout it doesn't seem like
      // all of these requests get caught
      await waitFor(
        () => {
          expect( apiMethod ).not.toHaveBeenCalled();
        },
        { timeout: 3000, interval: 500 }
      );
    }
    it( "should not make a request to users/me", async () => {
      await testApiMethodNotCalled( inatjs.users.me, global.realm );
    } );
    it( "should not make a request to observations/updates", async () => {
      await testApiMethodNotCalled( inatjs.observations.updates, global.realm );
    } );
  } );

  it( "should not have accessibility errors", async () => {
    const mockUser = factory( "LocalUser" );
    await signIn( mockUser );
    const observations = [factory( "RemoteObservation" )];
    inatjs.observations.search.mockResolvedValue( makeResponse( observations ) );
    const { queryByTestId } = renderAppWithComponent( <ObsList /> );
    await waitFor( () => {
      expect( queryByTestId( "ObservationViews.myObservations" ) ).toBeAccessible();
    } );
  } );

  describe( "accessibility + localization for current user", () => {
    it( "should be English by default", async () => {
      const mockUser = factory( "LocalUser" );
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser );
      const { queryByText } = renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( queryByText( / Observations/ ) ).toBeTruthy( );
      } );
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
    } );

    it( "should be Spanish if signed in user's locale is Spanish", async ( ) => {
      const mockSpanishUser = factory( "LocalUser", {
        locale: "es"
      } );
      expect( mockSpanishUser.locale ).toEqual( "es" );
      await signIn( mockSpanishUser );
      const { queryByText } = renderAppWithComponent( <ObsList /> );
      await waitFor( ( ) => {
        expect( queryByText( / Observaciones/ ) ).toBeTruthy( );
      } );
      expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
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

        const { findByText, queryByText } = renderAppWithComponent( <ObsList /> );
        // I'd prefer to wait for the Spanish text to appear, but that never
        // seems to wait long enough. This waits for the relevant API call to
        // have been made
        await waitFor( ( ) => {
          expect( inatjs.users.me ).toHaveBeenCalled( );
        } );
        expect( await findByText( / Observaciones/ ) ).toBeTruthy( );
        expect( queryByText( /X-Observations/ ) ).toBeFalsy( );
      }
    );
  } );
} );
