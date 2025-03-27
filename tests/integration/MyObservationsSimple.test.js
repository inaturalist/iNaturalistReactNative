// These test ensure that My Observation integrates with other systems like
// remote data retrieval and local data persistence

import { screen, waitFor } from "@testing-library/react-native";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer.tsx";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

const mockUnsyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          url: faker.image.url( ),
          position: 0
        }
      } )
    ]
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          url: `${faker.image.url( )}/100`,
          position: 0
        }
      } ),
      factory( "LocalObservationPhoto", {
        photo: {
          url: `${faker.image.url( )}/200`,
          position: 1
        }
      } )
    ]
  } )
];

jest.mock( "sharedHooks/useFontScale", () => ( {
  __esModule: true,
  default: ( ) => ( { isLargeFontScale: false } )
} ) );

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

const writeObservationsToRealm = ( observations, message ) => {
  const realm = global.mockRealms[__filename];
  safeRealmWrite( realm, ( ) => {
    observations.forEach( mockObservation => {
      realm.create( "Observation", mockObservation );
    } );
  }, message );
};

const displayItemByText = text => {
  const item = screen.getByText( text );
  expect( item ).toBeVisible( );
};

beforeEach( ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: true,
      shownOnce: {},
      isAllAddObsOptionsMode: false
    }
  } );
} );

describe( "MyObservationsSimple", ( ) => {
  describe( "when signed out", ( ) => {
    beforeEach( ( ) => {
      writeObservationsToRealm(
        mockUnsyncedObservations,
        "writing unsynced observations for MyObservations integration test"
      );
    } );

    it( "displays correct header", async () => {
      const realm = global.mockRealms[__filename];
      expect( realm.objects( "Observation" ).length ).toBeGreaterThan( 0 );
      renderAppWithComponent( <MyObservationsContainer /> );
      await waitFor( ( ) => {
        displayItemByText( /My Observations/ );
      } );
    } );
  } );
} );
