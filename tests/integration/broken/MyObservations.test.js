// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer.tsx";
import inatjs from "inaturalistjs";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { zustandStorage } from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

const mockDeletedIds = [
  faker.number.int( ),
  faker.number.int( )
];

jest.mock( "sharedHooks/useFontScale", () => ( {
  __esModule: true,
  default: ( ) => ( { isLargeFontScale: false } )
} ) );

const mockSyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    id: mockDeletedIds[0]
  } ),
  factory( "LocalObservation", {
    _synced_at: faker.date.past( )
  } )
];

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en"
} );

const writeObservationsToRealm = ( observations, message ) => {
  const realm = global.mockRealms[__filename];
  safeRealmWrite( realm, ( ) => {
    observations.forEach( mockObservation => {
      realm.create( "Observation", mockObservation );
    } );
  }, message );
};

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

beforeEach( ( ) => {
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true
  } );
} );

describe( "MyObservations", ( ) => {
  describe( "when signed in", ( ) => {
    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      jest.useFakeTimers( );
    } );

    afterEach( async ( ) => {
      await signOut( { realm: global.mockRealms[__filename] } );
    } );

    describe( "with synced observations", ( ) => {
      beforeEach( ( ) => {
        writeObservationsToRealm(
          mockSyncedObservations,
          "MyObservations integration test with synced observations"
        );
      } );

      afterEach( ( ) => {
        jest.clearAllMocks( );
      } );

      it( "should trigger manual observation sync on pull-to-refresh", async ( ) => {
        renderAppWithComponent( <MyObservationsContainer /> );

        const myObsList = await screen.findByTestId( "MyObservationsAnimatedList" );

        fireEvent.scroll( myObsList, {
          nativeEvent: {
            contentOffset: { y: -100 },
            contentSize: { height: 1000, width: 100 },
            layoutMeasurement: { height: 500, width: 100 }
          }
        } );

        expect( inatjs.observations.deleted ).toHaveBeenCalled( );
      } );

      describe( "on screen focus", ( ) => {
        beforeEach( ( ) => {
          zustandStorage.setItem( "lastDeletedSyncTime", "2024-05-01" );
        } );

        it( "downloads deleted observations from server when screen focused", async ( ) => {
          const realm = global.mockRealms[__filename];
          expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
          renderAppWithComponent( <MyObservationsContainer /> );
          await waitFor( ( ) => {
            expect( inatjs.observations.deleted ).toHaveBeenCalledWith(
              {
                since: "2024-05-01"
              },
              expect.anything( )
            );
          } );
        } );

        it( "deletes local observations if they have been deleted on server", async ( ) => {
          inatjs.observations.deleted.mockResolvedValue( makeResponse( mockDeletedIds ) );
          renderAppWithComponent( <MyObservationsContainer /> );
          const deleteSpy = jest.spyOn( global.mockRealms[__filename], "delete" );
          await waitFor( ( ) => {
            expect( deleteSpy ).toHaveBeenCalledTimes( 1 );
          } );
          expect( global.mockRealms[__filename].objects( "Observation" ).length ).toBe( 1 );
        } );
      } );
    } );
  } );
} );
