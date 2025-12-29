import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { screen, waitFor } from "@testing-library/react-native";
import ObsEdit from "components/ObsEdit/ObsEdit";
import fetchMock from "jest-fetch-mock";
import React from "react";
import ReactNativePermissions from "react-native-permissions";
import useStore from "stores/useStore";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

const initialStoreState = useStore.getState( );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
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
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

beforeEach( async ( ) => {
  useStore.setState( initialStoreState, true );
  const mockUser = factory( "LocalUser", {
    login: faker.internet.userName( ),
    iconUrl: faker.image.url( ),
    locale: "en",
  } );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  const mockedPermissions = {
    "ios.permission.LOCATION": "granted",
  };

  jest.spyOn( ReactNativePermissions, "checkMultiple" )
    .mockResolvedValueOnce( mockedPermissions );

  jest.useFakeTimers( );
} );

afterEach( ( ) => {
  signOut( { realm: global.mockRealms[__filename] } );
  jest.clearAllMocks( );
} );

describe( "ObsEdit offline", ( ) => {
  beforeEach( ( ) => {
    // Turn on fetch mocks and make all fetch requests throw an error
    fetchMock.doMock( );
    fetch.mockAbort( );
    expect( fetch( "/" ) ).rejects.toThrow( );

    // Mock NetInfo so it says internet is not reachable
    NetInfo.fetch.mockImplementation( async ( ) => ( {
      isConnected: false,
    } ) );
  } );

  afterEach( ( ) => {
    fetchMock.dontMock( );
  } );

  describe( "creation", ( ) => {
    it( "should fetch coordinates", async ( ) => {
      const mockWatchPositionSuccess = jest.fn( success => success( {
        coords: {
          latitude: 1,
          longitude: 1,
          accuracy: 9,
        },
        timestamp: Date.now( ),
      } ) );
      const mockWatchPosition = jest.fn( ( success, _error, _options ) => {
        setTimeout( ( ) => mockWatchPositionSuccess( success ), 100 );
        return 0;
      } );
      Geolocation.watchPosition.mockImplementation( mockWatchPosition );
      const observation = factory( "LocalObservation", {
        observationPhotos: [],
      } );
      useStore.setState( {
        observations: [observation],
        currentObservation: observation,
      } );
      renderAppWithComponent(
        <ObsEdit />,
      );
      await screen.findByTestId( "EvidenceSection.fetchingLocationIndicator" );
      await waitFor( ( ) => {
        expect( mockWatchPositionSuccess ).toHaveBeenCalled( );
      } );
      const coords = await screen.findByText( /Lat: 1/ );
      expect( coords ).toBeTruthy( );
      expect( screen.queryByText( "Finding location..." ) ).toBeFalsy( );
      await waitFor( ( ) => {
        const indicator = screen.queryByTestId( "EvidenceSection.fetchingLocationIndicator" );
        expect( indicator ).toBeFalsy( );
      }, { timeout: 5_000, interval: 500 } );
    } );
  } );
} );
