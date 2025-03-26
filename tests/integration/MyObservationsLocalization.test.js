import { screen, waitFor } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer.tsx";
// import inatjs from "inaturalistjs";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
// import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier],
      useQuery: ( ) => []
    }
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en"
} );

// const mockSpanishUser = factory( "LocalUser", {
//   login: faker.internet.userName( ),
//   iconUrl: faker.image.url( ),
//   locale: "es"
// } );

beforeEach( ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: false,
      isAllAddObsOptionsMode: true
    }
  } );
} );

describe( "MyObservations", ( ) => {
  describe( "localization for current user", ( ) => {
    afterEach( async ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
    } );
    it( "should be English by default", async ( ) => {
      expect( mockUser.locale ).toEqual( "en" );
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      renderAppWithComponent( <MyObservationsContainer /> );
      await waitFor( ( ) => {
        // since we haven't loaded any observations in here, user will see the empty screen
        // after logging in
        expect( screen.getByText( /Use iNaturalist to identify any living thing/ ) ).toBeTruthy( );
      } );
    } );

    // 20240730 - amanda - hiding these since we're not soft launching with internationalization

    // it( "should be Spanish if signed in user's locale is Spanish", async ( ) => {
    //   expect( mockSpanishUser.locale ).toEqual( "es" );
    //   await signIn( mockSpanishUser, { realm: global.mockRealms[__filename] } );
    //   renderAppWithComponent( <MyObservationsContainer /> );
    //   await waitFor( ( ) => {
    //     expect( screen.getByText( /Bienvenido a iNaturalist/ ) ).toBeTruthy();
    //   } );
    //   expect( screen.queryByText( /Welcome/ ) ).toBeFalsy( );
    // } );

    // it(
    //   "should change to es when local user locale is en but remote user locale is es",
    //   async ( ) => {
    //     expect( mockUser.locale ).toEqual( "en" );
    //     await signIn( mockUser, { realm: global.mockRealms[__filename] } );

    //     const mockSpanishUser2 = factory( "LocalUser", {
    //       locale: "es"
    //     } );
    //     inatjs.users.me.mockResolvedValue( makeResponse( [mockSpanishUser2] ) );

    //     renderAppWithComponent( <MyObservationsContainer /> );
    //     // I'd prefer to wait for the Spanish text to appear, but that never
    //     // seems to wait long enough. This waits for the relevant API call to
    //     // have been made
    //     await waitFor( ( ) => {
    //       expect( inatjs.users.me ).toHaveBeenCalled( );
    //     } );
    //     expect( screen.getByText( /Bienvenido a iNaturalist/ ) ).toBeTruthy( );
    //     expect( screen.queryByText( /Welcome/ ) ).toBeFalsy( );
    //   }
    // );
  } );
} );
