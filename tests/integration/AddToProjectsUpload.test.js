import { useNetInfo } from "@react-native-community/netinfo";
import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import {
  MS_BEFORE_TOOLBAR_RESET,
} from "components/MyObservations/hooks/useUploadObservations";
import inatjs from "inaturalistjs";
import { useSyncExternalStore } from "react";
import { Alert } from "react-native";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// We're explicitly using navigation here
jest.unmock( "@react-navigation/native" );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll }
  = setupUniqueRealm( mockRealmIdentifier );
jest.mock( "realmModels/index", () => mockRealmModelsIndex );
jest.mock( "providers/contexts", () => {
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

const actor = userEvent.setup( );
const realm = ( ) => global.mockRealms[__filename];

const mockUser = factory( "LocalUser", {
  login: faker.internet.username( ),
  iconUrl: faker.image.url( ),
  locale: "en",
} );

const ONLINE = { isConnected: true, isInternetReachable: true };
const OFFLINE = { isConnected: false, isInternetReachable: false };

// The netinfo mock returns a static value, so components never re-render when
// it changes. Back it with a store so a connectivity change re-renders every
// useNetInfo consumer, like the real hook
const networkState = { current: ONLINE, listeners: new Set( ) };
const subscribeToNetwork = listener => {
  networkState.listeners.add( listener );
  return ( ) => networkState.listeners.delete( listener );
};
const setNetworkState = async state => {
  await act( async ( ) => {
    networkState.current = state;
    networkState.listeners.forEach( listener => listener( ) );
  } );
};

// Wait for the toolbar reset timeout so there aren't any pending async
// processes that interfere with subsequent tests
const waitForUploadStateReset = async ( ) => {
  await waitFor( ( ) => {
    expect( useStore.getState( ).uploadStatus ).toEqual( "pending" );
  }, { timeout: MS_BEFORE_TOOLBAR_RESET + 2000, interval: 500 } );
};

// inatjs rejects with the raw fetch response; api/error#handleError turns it
// into an INatApiError, so mock at that level to exercise the real parsing
const make422 = ruleMessage => {
  const error = new Error( "Unprocessable Entity" );
  error.response = {
    status: 422,
    url: "https://api.inaturalist.org/v2/project_observations",
    json: async ( ) => ( {
      status: "422",
      errors: [{
        errorCode: "422",
        message: JSON.stringify( { errors: [[ruleMessage]] } ),
        from: null,
        stack: null,
      }],
    } ),
  };
  return error;
};

beforeAll( ( ) => {
  jest.useFakeTimers( );
} );

beforeEach( async ( ) => {
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true,
  } );
  setStoreStateFeatureFlags( {
    [FeatureFlag.TraditionalProjectsEnabled]: true,
  } );
  jest.spyOn( Alert, "alert" ).mockImplementation( ( ) => undefined );
  networkState.current = ONLINE;
  useNetInfo.mockImplementation(
    ( ) => useSyncExternalStore( subscribeToNetwork, ( ) => networkState.current ),
  );
  inatjs.observations.create.mockClear( );
  inatjs.observations.update.mockClear( );
  inatjs.project_observations.create.mockClear( );
  inatjs.project_observations.delete.mockClear( );
  inatjs.observation_field_values.create.mockClear( );
  await signIn( mockUser, { realm: realm( ) } );
} );

afterEach( async ( ) => {
  Alert.alert.mockRestore( );
  await signOut( { realm: realm( ) } );
} );

const displayItemByText = text => {
  const item = screen.getByText( text );
  expect( item ).toBeVisible( );
};

describe( "deselecting a synced project observation", ( ) => {
  const mockProject = factory( "RemoteProject", {
    project_observation_fields: [],
  } );
  const syncedPoUuid = faker.string.uuid( );
  const syncedPo = {
    uuid: syncedPoUuid,
    id: faker.number.int( ),
    project: { id: mockProject.id },
  };
  const remoteObservationWithPo = factory( "RemoteObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    user: mockUser,
    project_observations: [syncedPo],
  } );
  const remoteObservationWithoutPo = {
    ...remoteObservationWithPo,
    project_observations: [],
  };

  const localObservation = ( ) => realm( ).objectForPrimaryKey(
    "Observation",
    remoteObservationWithPo.uuid,
  );

  beforeEach( ( ) => {
    inatjs.users.projects.mockResolvedValue( makeResponse( [mockProject] ) );
    inatjs.observations.fetch.mockResolvedValue( makeResponse( [remoteObservationWithPo] ) );
    inatjs.observations.search.mockResolvedValue( makeResponse( [remoteObservationWithPo] ) );
    inatjs.observations.update.mockImplementation( params => {
      // Fake timers freeze Date, so without a simulated round trip the
      // observation's _synced_at would equal the _updated_at set on save
      jest.setSystemTime( Date.now( ) + 1000 );
      return Promise.resolve( makeResponse( [{
        id: remoteObservationWithPo.id,
        uuid: params.id,
      }] ) );
    } );
    inatjs.project_observations.delete.mockImplementation( async ( ) => {
      // The server no longer has the PO, so later refreshes shouldn't either
      inatjs.observations.fetch.mockResolvedValue(
        makeResponse( [remoteObservationWithoutPo] ),
      );
      inatjs.observations.search.mockResolvedValue(
        makeResponse( [remoteObservationWithoutPo] ),
      );
    } );
  } );

  afterEach( ( ) => {
    inatjs.users.projects.mockReset( );
    inatjs.observations.fetch.mockReset( );
    inatjs.observations.search.mockResolvedValue( makeResponse( ) );
    inatjs.observations.update.mockReset( );
    inatjs.project_observations.delete.mockReset( );
    inatjs.project_observations.delete.mockResolvedValue( undefined );
  } );

  const openObsDetails = async ( ) => {
    const gridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${remoteObservationWithPo.uuid}`,
    );
    await actor.press( gridItem );
    await waitFor( ( ) => {
      expect( inatjs.observations.fetch ).toHaveBeenCalled( );
    } );
  };

  const deselectProjectAndSave = async saveButtonTestID => {
    const editButton = await screen.findByLabelText( "Edit" );
    await actor.press( editButton );
    const addToProjectsRow = await screen.findByLabelText( /Added to 1 Project/ );
    await actor.press( addToProjectsRow );
    const projectRow = await screen.findByTestId( `AddToProjects.project.${mockProject.id}` );
    expect( projectRow ).toBeChecked( );
    await actor.press( projectRow );
    expect( projectRow ).not.toBeChecked( );
    await actor.press( screen.getByTestId( "AddToProjects.saveButton" ) );
    const saveButton = await screen.findByTestId( saveButtonTestID );
    await actor.press( saveButton );
  };

  it( "deletes the PO on the server when saved online", async ( ) => {
    await renderAppWithObservations( [remoteObservationWithPo], __filename );
    await openObsDetails( );
    expect( localObservation( ).projectObservations ).toHaveLength( 1 );
    await deselectProjectAndSave( "ObsEdit.saveChangesButton" );

    // Saving a synced observation online queues the upload itself
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );
    expect( inatjs.project_observations.delete ).toHaveBeenCalledTimes( 1 );
    expect( inatjs.project_observations.delete ).toHaveBeenCalledWith(
      { id: syncedPoUuid },
      expect.anything( ),
    );
    expect( localObservation( ).projectObservations ).toHaveLength( 0 );
    expect( localObservation( ).needsSync( ) ).toBe( false );
    expect( useStore.getState( ).errorsByUuid ).toEqual( {} );
    await waitForUploadStateReset( );
  } );

  it( "keeps the PO tombstoned offline and deletes it on SyncButton", async ( ) => {
    await renderAppWithObservations( [remoteObservationWithPo], __filename );
    await openObsDetails( );
    await setNetworkState( OFFLINE );
    // Offline, ObsEdit only offers a plain save
    await deselectProjectAndSave( "ObsEdit.saveButton" );

    await screen.findByTestId( `MyObservations.obsGridItem.${remoteObservationWithPo.uuid}` );
    expect( inatjs.observations.update ).not.toHaveBeenCalled( );
    expect( inatjs.project_observations.delete ).not.toHaveBeenCalled( );
    expect( localObservation( ).projectObservations ).toHaveLength( 1 );
    expect( localObservation( ).projectObservations[0]._pending_deletion ).toBe( true );

    await setNetworkState( ONLINE );
    await waitFor( ( ) => {
      displayItemByText( /Upload 1 observation/ );
    } );
    const searchCallsBeforeSync = inatjs.observations.search.mock.calls.length;
    fireEvent.press( screen.getByTestId( "SyncButton" ) );
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );

    // SyncButton refreshes from the server, which still has the PO, before it
    // uploads. The refresh has to skip the locally edited observation, or it
    // would overwrite the tombstone and no DELETE would go out
    expect( inatjs.observations.search.mock.calls.length )
      .toBeGreaterThan( searchCallsBeforeSync );
    const lastSearchOrder = Math.max( ...inatjs.observations.search.mock.invocationCallOrder );
    expect( inatjs.project_observations.delete ).toHaveBeenCalledTimes( 1 );
    expect( inatjs.project_observations.delete.mock.invocationCallOrder[0] )
      .toBeGreaterThan( lastSearchOrder );
    expect( inatjs.project_observations.delete ).toHaveBeenCalledWith(
      { id: syncedPoUuid },
      expect.anything( ),
    );
    expect( localObservation( ).projectObservations ).toHaveLength( 0 );
    expect( localObservation( ).needsSync( ) ).toBe( false );
    await waitForUploadStateReset( );
  } );
} );

describe( "422 surfacing", ( ) => {
  const projectId = faker.number.int( );
  const obsFieldId = faker.number.int( );
  const ruleMessage = "Observation must be wild";
  const unsyncedObservation = factory( "LocalObservation", {
    _synced_at: null,
    captive_flag: true,
    observed_on_string: "2024-05-01",
    latitude: 1.2345,
    longitude: 1.2345,
    projectObservations: [{
      uuid: faker.string.uuid( ),
      projectId,
    }],
    observationFieldValues: [{
      uuid: faker.string.uuid( ),
      obsFieldId,
      value: "shrubland",
    }],
  } );

  beforeEach( ( ) => {
    inatjs.observations.create.mockImplementation( params => {
      // Fake timers freeze Date, so without a simulated round trip the
      // observation's _synced_at would equal the _updated_at set on save
      jest.setSystemTime( Date.now( ) + 1000 );
      return Promise.resolve( makeResponse( [{
        id: faker.number.int( ),
        uuid: params.observation.uuid,
      }] ) );
    } );
    inatjs.observation_field_values.create.mockResolvedValue(
      makeResponse( [{ id: faker.number.int( ) }] ),
    );
  } );

  const localObservation = ( ) => realm( ).objectForPrimaryKey(
    "Observation",
    unsyncedObservation.uuid,
  );

  const uploadUntilProjectObservation422 = async ( ) => {
    inatjs.project_observations.create.mockRejectedValue( make422( ruleMessage ) );
    await renderAppWithObservations( [unsyncedObservation], __filename );
    await waitFor( ( ) => {
      displayItemByText( /Upload 1 observation/ );
    } );
    fireEvent.press( screen.getByTestId( "SyncButton" ) );
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );
  };

  it( "surfaces a 422 and keeps the OFV that already uploaded", async ( ) => {
    await uploadUntilProjectObservation422( );

    expect( Alert.alert ).toHaveBeenCalledWith( "Error", ruleMessage );
    displayItemByText( /1 upload failed/ );
    expect( localObservation( ).uploadErrorMessage ).toEqual( ruleMessage );
    expect( inatjs.observation_field_values.create ).toHaveBeenCalledTimes( 1 );
    expect( localObservation( ).observationFieldValues[0].needsSync( ) ).toBe( false );
    expect( localObservation( ).projectObservations[0].needsSync( ) ).toBe( true );
    expect( localObservation( ).needsSync( ) ).toBe( true );
    await waitForUploadStateReset( );
  } );

  it( "uploads the PO without resending the OFV after the user fixes a 422", async ( ) => {
    await uploadUntilProjectObservation422( );
    await waitForUploadStateReset( );
    inatjs.project_observations.create.mockResolvedValue(
      makeResponse( [{ id: faker.number.int( ) }] ),
    );

    // Fix the rule violation in ObsEdit, then upload from there
    await actor.press(
      screen.getByTestId( `MyObservations.obsGridItem.${unsyncedObservation.uuid}` ),
    );
    await actor.press( await screen.findByLabelText( "Select captive or cultivated status" ) );
    await actor.press( await screen.findByLabelText( "Wild" ) );
    await actor.press( screen.getByLabelText( "CONFIRM" ) );
    await actor.press( screen.getByTestId( "ObsEdit.uploadButton" ) );
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );

    // The first attempt created the observation but failed before marking it
    // synced, so the retry sends a create for the same uuid again
    expect( inatjs.observations.create ).toHaveBeenCalledTimes( 2 );
    expect( inatjs.observations.update ).not.toHaveBeenCalled( );
    expect( inatjs.observations.create.mock.calls[1][0].observation ).toMatchObject( {
      uuid: unsyncedObservation.uuid,
      captive_flag: false,
    } );
    expect( inatjs.project_observations.create ).toHaveBeenCalledTimes( 2 );
    expect( inatjs.observation_field_values.create ).toHaveBeenCalledTimes( 1 );
    expect( localObservation( ).uploadErrorMessage ).toBeNull( );
    expect( localObservation( ).projectObservations[0].needsSync( ) ).toBe( false );
    expect( localObservation( ).needsSync( ) ).toBe( false );
    await waitForUploadStateReset( );
  } );
} );
