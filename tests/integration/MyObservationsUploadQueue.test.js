// The first three tests reproduce the pre-fix MOB-1543 bug: one bad upload
// (hanging, failing, or cancelled) aborted the shared session
// AbortController and blocked other observations in the upload queue. The
// last test guards the per-upload abort listener/timer cleanup the fix
// introduced.

import {
  act, fireEvent, screen, waitFor,
} from "@testing-library/react-native";
import {
  MS_BEFORE_TOOLBAR_RESET,
  MS_BEFORE_UPLOAD_TIMES_OUT,
} from "components/MyObservations/hooks/useUploadObservations";
import MyObservationsContainer from "components/MyObservations/MyObservationsContainer";
import inatjs from "inaturalistjs";
import React from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithComponent } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// Observations without media so the only API request in the upload chain is
// observations.create, which each test controls call-by-call
const mockUnsyncedObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    observed_on_string: "2024-05-01",
    latitude: 1.2345,
    longitude: 1.2345,
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observed_on_string: "2024-05-02",
    latitude: 1.2345,
    longitude: 1.2345,
  } ),
  factory( "LocalObservation", {
    _synced_at: null,
    observed_on_string: "2024-05-03",
    latitude: 1.2345,
    longitude: 1.2345,
  } ),
];

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en",
} );

jest.mock( "sharedHooks/useFontScale", () => ( {
  __esModule: true,
  default: ( ) => ( { isLargeFontScale: false } ),
} ) );

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

const newAbortError = ( ) => {
  const error = new Error( "Aborted" );
  error.name = "AbortError";
  return error;
};

const successfulCreateResponse = uuid => makeResponse( [{
  id: faker.number.int( ),
  uuid,
}] );

const displayItemByText = text => {
  const item = screen.getByText( text );
  expect( item ).toBeVisible( );
};

const startUploadsViaSyncButton = async ( ) => {
  renderAppWithComponent( <MyObservationsContainer /> );
  await waitFor( ( ) => {
    displayItemByText( /Upload 3 observations/ );
  } );
  fireEvent.press( screen.getByTestId( "SyncButton" ) );
};

// Synchronous timer advance wrapped in act so pending promise callbacks and
// effects flush after the advance; advanceTimersByTimeAsync is too slow for
// jumps as long as the upload timeout
const advanceTimers = async ms => {
  await act( async ( ) => {
    jest.advanceTimersByTime( ms );
  } );
};

// Wait for the toolbar reset timeout so there aren't any pending async
// processes that interfere with subsequent tests
const waitForUploadStateReset = async ( ) => {
  await waitFor( ( ) => {
    expect( useStore.getState( ).uploadStatus ).toEqual( "pending" );
  }, { timeout: MS_BEFORE_TOOLBAR_RESET + 2000, interval: 500 } );
};

describe( "MyObservations upload queue", ( ) => {
  beforeEach( async ( ) => {
    setStoreStateLayout( {
      isDefaultMode: false,
      isAllAddObsOptionsMode: true,
    } );
    await signIn( mockUser, { realm: global.mockRealms[__filename] } );
    jest.useFakeTimers( );
    safeRealmWrite( global.mockRealms[__filename], ( ) => {
      mockUnsyncedObservations.forEach( mockObservation => {
        global.mockRealms[__filename].create( "Observation", mockObservation );
      } );
    }, "writing unsynced observations for MyObservationsUploadQueue integration test" );
    inatjs.observations.create.mockClear( );
    inatjs.observations.fetch.mockImplementation( ( uuid, _params, _opts ) => {
      const mockObs = mockUnsyncedObservations.find( o => o.uuid === uuid );
      return Promise.resolve( makeResponse( [mockObs] ) );
    } );
  } );

  afterEach( async ( ) => {
    await signOut( { realm: global.mockRealms[__filename] } );
  } );

  it( "uploads remaining observations after one upload times out", async ( ) => {
    let hangingUuid;
    const uploadedUuids = [];
    inatjs.observations.create.mockImplementation( ( params, opts ) => {
      const { uuid } = params.observation;
      // The first queued upload hangs until its abort signal fires; the
      // pre-fix code let this strand the rest of the queue
      if ( inatjs.observations.create.mock.calls.length === 1 ) {
        hangingUuid = uuid;
        return new Promise( ( _resolve, reject ) => {
          opts.signal.addEventListener( "abort", ( ) => reject( newAbortError( ) ) );
        } );
      }
      uploadedUuids.push( uuid );
      return Promise.resolve( successfulCreateResponse( uuid ) );
    } );

    await startUploadsViaSyncButton( );
    await waitFor( ( ) => {
      expect( hangingUuid ).toBeTruthy( );
    } );
    await advanceTimers( MS_BEFORE_UPLOAD_TIMES_OUT + 1000 );
    await waitFor( ( ) => {
      expect( useStore.getState( ).errorsByUuid[hangingUuid] ).toContain( "aborted" );
    } );
    await waitFor( ( ) => {
      expect( uploadedUuids ).toHaveLength( 2 );
    } );
    expect( uploadedUuids ).not.toContain( hangingUuid );
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );
    displayItemByText( /1 upload failed/ );
    displayItemByText( /2 observations uploaded/ );
    await waitForUploadStateReset( );
  } );

  it( "does not abort later uploads after an earlier upload fails quickly", async ( ) => {
    const firstUploadFailsAfterMs = 30_000;
    // Resolves before its own 5 min timeout, but after the point where a
    // timer orphaned by the first failure would have fired
    const secondUploadResolvesAfterMs = MS_BEFORE_UPLOAD_TIMES_OUT - 15_000;
    let failedUuid;
    let secondUploadAborted = false;
    const uploadedUuids = [];
    inatjs.observations.create.mockImplementation( ( params, opts ) => {
      const { uuid } = params.observation;
      const callNumber = inatjs.observations.create.mock.calls.length;
      if ( callNumber === 1 ) {
        failedUuid = uuid;
        return new Promise( ( _resolve, reject ) => {
          setTimeout(
            ( ) => reject( new TypeError( "Network request failed" ) ),
            firstUploadFailsAfterMs,
          );
        } );
      }
      if ( callNumber === 2 ) {
        return new Promise( ( resolve, reject ) => {
          opts.signal.addEventListener( "abort", ( ) => {
            secondUploadAborted = true;
            reject( newAbortError( ) );
          } );
          setTimeout( ( ) => {
            uploadedUuids.push( uuid );
            resolve( successfulCreateResponse( uuid ) );
          }, secondUploadResolvesAfterMs );
        } );
      }
      uploadedUuids.push( uuid );
      return Promise.resolve( successfulCreateResponse( uuid ) );
    } );

    await startUploadsViaSyncButton( );
    await waitFor( ( ) => {
      expect( inatjs.observations.create ).toHaveBeenCalledTimes( 1 );
    } );
    await advanceTimers( firstUploadFailsAfterMs + 1000 );
    await waitFor( ( ) => {
      expect( inatjs.observations.create ).toHaveBeenCalledTimes( 2 );
    } );
    // This advance crosses the point where a timer orphaned by the first
    // failure would have aborted the whole session on pre-fix code
    await advanceTimers( secondUploadResolvesAfterMs + 1000 );
    expect( secondUploadAborted ).toBe( false );
    await waitFor( ( ) => {
      expect( uploadedUuids ).toHaveLength( 2 );
    } );
    await waitFor( ( ) => {
      expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    } );
    expect( Object.keys( useStore.getState( ).errorsByUuid ) ).toEqual( [failedUuid] );
    await waitForUploadStateReset( );
  } );

  it( "cancels in-flight and queued uploads when user stops uploads", async ( ) => {
    let firstUploadAborted = false;
    inatjs.observations.create.mockImplementation( ( params, opts ) => {
      if ( inatjs.observations.create.mock.calls.length === 1 ) {
        return new Promise( ( _resolve, reject ) => {
          opts.signal.addEventListener( "abort", ( ) => {
            firstUploadAborted = true;
            reject( newAbortError( ) );
          } );
        } );
      }
      return Promise.resolve( successfulCreateResponse( params.observation.uuid ) );
    } );

    await startUploadsViaSyncButton( );
    const stopUploadButton = await screen.findByLabelText( "Stop upload" );
    fireEvent.press( stopUploadButton );
    await waitFor( ( ) => {
      expect( firstUploadAborted ).toBe( true );
    } );
    // Give any erroneous queue advancement a chance to happen
    await advanceTimers( 1000 );
    expect( useStore.getState( ).uploadStatus ).toEqual( "cancelled" );
    // A user-initiated stop should not be recorded as an upload error
    expect( useStore.getState( ).errorsByUuid ).toEqual( {} );
    expect( inatjs.observations.create ).toHaveBeenCalledTimes( 1 );
    await waitForUploadStateReset( );
  } );

  // Note: this scenario also passed pre-fix (each session mints a fresh
  // AbortController, so a cancelled session never contaminated the next
  // one). It pins the fix's cleanup wiring instead: if the session abort
  // listener or per-upload timeout leaked out of a cancelled session, this
  // fresh-session re-upload is where it would surface.
  it( "uploads all observations in a new session after user cancelled", async ( ) => {
    inatjs.observations.create.mockImplementation( ( params, opts ) => {
      if ( inatjs.observations.create.mock.calls.length === 1 ) {
        return new Promise( ( _resolve, reject ) => {
          opts.signal.addEventListener( "abort", ( ) => reject( newAbortError( ) ) );
        } );
      }
      return Promise.resolve( successfulCreateResponse( params.observation.uuid ) );
    } );

    await startUploadsViaSyncButton( );
    const stopUploadButton = await screen.findByLabelText( "Stop upload" );
    fireEvent.press( stopUploadButton );
    // After the toolbar resets, all three observations still need upload
    await waitFor( ( ) => {
      displayItemByText( /Upload 3 observations/ );
    }, { timeout: MS_BEFORE_TOOLBAR_RESET + 2000, interval: 500 } );
    fireEvent.press( screen.getByTestId( "SyncButton" ) );
    await waitFor( ( ) => {
      displayItemByText( /3 observations uploaded/ );
    } );
    expect( useStore.getState( ).uploadStatus ).toEqual( "complete" );
    expect( useStore.getState( ).errorsByUuid ).toEqual( {} );
    await waitForUploadStateReset( );
  } );
} );
