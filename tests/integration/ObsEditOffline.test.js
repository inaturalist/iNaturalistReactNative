import { faker } from "@faker-js/faker";
import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import initI18next from "i18n/initI18next";
import fetchMock from "jest-fetch-mock";
import os from "os";
import path from "path";
import React from "react";
import Realm from "realm";
import realmConfig from "realmModels/index";
import { LOCATION_FETCH_INTERVAL } from "sharedHooks/useCurrentObservationLocation";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";
import { signIn, signOut } from "tests/helpers/user";

const initialStoreState = useStore.getState( );

// REALM SETUP
const mockRealmConfig = {
  schema: realmConfig.schema,
  schemaVersion: realmConfig.schemaVersion,
  // No need to actually write to disk
  inMemory: true,
  // For an in memory db path is basically a unique identifier, *but* Realm
  // may still write some metadata to disk, so this needs to be a real, but
  // temporary, path. In theory this should prevent this test from
  // interacting with other tests
  path: path.join( os.tmpdir( ), `${path.basename( __filename )}.realm` )
};

// Mock the config so that all code that runs during this test talks to the same database
jest.mock( "realmModels/index", ( ) => ( {
  __esModule: true,
  default: mockRealmConfig
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[__filename]
    }
  };
} );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
  useStore.setState( initialStoreState, true );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

beforeEach( async ( ) => {
  useStore.setState( initialStoreState, true );
  const mockUser = factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en"
  } );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( ( ) => {
  signOut( { realm: global.mockRealms[__filename] } );
  jest.clearAllMocks( );
} );

describe( "ObsEdit offline", ( ) => {
  beforeAll( async () => {
    await initI18next();
  } );

  beforeEach( ( ) => {
    // Turn on fetch mocks and make all fetch requests throw an error
    fetchMock.doMock( );
    fetch.mockAbort( );
    expect( fetch( "/" ) ).rejects.toThrow( );

    // Mock NetInfo so it says internet is not reachable
    NetInfo.fetch.mockImplementation( async ( ) => ( {
      isInternetReachable: false
    } ) );
  } );

  afterEach( ( ) => {
    fetchMock.dontMock( );
  } );

  describe( "creation", ( ) => {
    it( "should fetch coordinates", async ( ) => {
      const mockGetCurrentPosition = jest.fn( ( success, _error, _options ) => success( {
        coords: {
          latitude: 1,
          longitude: 1,
          accuracy: 10,
          timestamp: Date.now( )
        }
      } ) );
      Geolocation.getCurrentPosition.mockImplementation( mockGetCurrentPosition );
      const observation = factory( "LocalObservation", {
        observationPhotos: []
      } );
      useStore.setState( { observations: [observation] } );
      renderAppWithComponent(
        <ObsEdit />
      );
      await waitFor( ( ) => {
        expect(
          screen.getByTestId( "EvidenceSection.fetchingLocationIndicator" )
        ).toBeTruthy( );
      } );
      await waitFor( ( ) => {
        expect( mockGetCurrentPosition ).toHaveBeenCalled( );
      }, { timeout: LOCATION_FETCH_INTERVAL * 2 } );
      const coords = await screen.findByText( /Lat:/ );
      expect( coords ).toBeTruthy( );
      expect( screen.queryByText( "Finding location..." ) ).toBeFalsy( );
      await waitFor( ( ) => {
        expect(
          screen.queryByTestId( "EvidenceSection.fetchingLocationIndicator" )
        ).toBeFalsy( );
      } );
    } );
  } );
} );
