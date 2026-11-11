import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import {
  adjustIconicTaxaObservationCount,
} from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import useUploadObservations from "components/MyObservations/hooks/useUploadObservations";
import initI18next from "i18n/initI18next";
import React from "react";
import { ICONIC_TAXA_GROUP } from "sharedHelpers/iconicTaxaGroupOrder";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useCurrentUser from "sharedHooks/useCurrentUser";
import { UPLOAD_IN_PROGRESS } from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";
import factory from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import uploadObservation from "uploaders/observationUploader";

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  const { makeRealmHooks } = jest.requireActual( "tests/helpers/uniqueRealm" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      ...makeRealmHooks( __filename ),
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

jest.mock( "uploaders/observationUploader", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "components/MyObservations/hooks/useIconicTaxaObservationCounts", ( ) => ( {
  __esModule: true,
  adjustIconicTaxaObservationCount: jest.fn( ),
} ) );
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ),
} ) );
jest.mock( "@react-navigation/native", ( ) => ( {
  ...jest.requireActual( "@react-navigation/native" ),
  useNavigation: ( ) => ( { navigate: jest.fn( ) } ),
} ) );

const mockUser = factory( "LocalUser" );

const realm = ( ) => global.mockRealms[mockRealmIdentifier];

const createObservation = observation => safeRealmWrite( realm( ), ( ) => {
  realm( ).create( "Observation", observation, "modified" );
}, "create test observation for useUploadObservations" );

// What the uploader does once the server has created the record
const markSynced = uuid => safeRealmWrite( realm( ), ( ) => {
  const observation = realm( ).objectForPrimaryKey( "Observation", uuid );
  observation._synced_at = new Date( );
  observation.needs_sync = false;
}, "mark test observation synced for useUploadObservations" );

const birdObservation = ( overrides = {} ) => factory( "LocalObservation", {
  needs_sync: true,
  taxon: factory( "LocalTaxon", { iconic_taxon_name: "Aves" } ),
  ...overrides,
} );

const uploadOnly = async observation => {
  createObservation( observation );
  const queryClient = new QueryClient( );
  const wrapper = ( { children } ) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  renderHook( ( ) => useUploadObservations( true ), { wrapper } );
  act( ( ) => {
    useStore.setState( {
      abortController: new AbortController( ),
      uploadQueue: [observation.uuid],
      uploadStatus: UPLOAD_IN_PROGRESS,
    } );
  } );
  await waitFor( ( ) => expect( uploadObservation ).toHaveBeenCalled( ) );
  await waitFor( ( ) => expect( useStore.getState( ).uploadQueue ).toEqual( [] ) );
};

beforeAll( async ( ) => {
  await initI18next( );
} );

beforeEach( ( ) => {
  useCurrentUser.mockReturnValue( mockUser );
} );

afterEach( ( ) => {
  jest.clearAllMocks( );
  useStore.getState( ).resetUploadObservationsSlice( );
  useStore.setState( { firstUploadUuids: [] } );
  safeRealmWrite( realm( ), ( ) => {
    realm( ).deleteAll( );
  }, "clear realm after each useUploadObservations test" );
} );

describe( "useUploadObservations, for small grid sections", ( ) => {
  it( "records a first-time upload and raises its category's count", async ( ) => {
    const observation = birdObservation( { _synced_at: null } );
    uploadObservation.mockImplementation( async ( ) => markSynced( observation.uuid ) );

    await uploadOnly( observation );

    expect( useStore.getState( ).firstUploadUuids ).toEqual( [observation.uuid] );
    expect( adjustIconicTaxaObservationCount ).toHaveBeenCalledWith(
      expect.anything( ),
      mockUser.id,
      ICONIC_TAXA_GROUP.AVES,
      1,
    );
  } );

  it( "leaves an edit to an already uploaded observation alone, so it goes back to its own "
    + "place in its section", async ( ) => {
    const observation = birdObservation( { _synced_at: new Date( "2026-01-01" ) } );
    uploadObservation.mockImplementation( async ( ) => markSynced( observation.uuid ) );

    await uploadOnly( observation );

    expect( useStore.getState( ).firstUploadUuids ).toEqual( [] );
    expect( adjustIconicTaxaObservationCount ).not.toHaveBeenCalled( );
  } );

  it( "doesn't raise the count when the upload fails before the server creates the "
    + "record", async ( ) => {
    const observation = birdObservation( { _synced_at: null } );
    uploadObservation.mockRejectedValue( new Error( "Network request failed" ) );

    await uploadOnly( observation );

    expect( adjustIconicTaxaObservationCount ).not.toHaveBeenCalled( );
  } );
} );
