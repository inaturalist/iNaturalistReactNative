// Bugs found on the Match screen beyond the ones Match.requirements.test.js
// already records. Each scenario enforces today's (buggy) behavior on purpose:
// fixing the bug should be a deliberate change to the expectation.
import * as Exify from "@lodev09/react-native-exify";
import {
  screen, userEvent, waitFor,
} from "@testing-library/react-native";
import * as apiError from "api/error";
import initI18next from "i18n/initI18next";
import useStore from "stores/useStore";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

import { renderMatch } from "./matchHarness";
import {
  ICONIC_TAXA,
  makeNewObservation,
  makeWorld,
  prediction,
  suggestion,
  TAXA,
} from "./matchWorld";

jest.unmock( "@react-navigation/native" );

// NetInfo whose answer can change mid-test and re-render whoever is listening
jest.mock( "@react-native-community/netinfo", ( ) => {
  const mockReact = jest.requireActual( "react" );
  let mockState = { isConnected: true, isInternetReachable: true, type: "wifi" };
  const mockListeners = new Set( );
  global.mockNetwork = {
    set: next => {
      mockState = { ...mockState, ...next };
      mockListeners.forEach( listener => listener( mockState ) );
    },
  };
  const subscribe = listener => {
    mockListeners.add( listener );
    return ( ) => mockListeners.delete( listener );
  };
  const mockNetInfo = {
    configure: jest.fn( ),
    fetch: jest.fn( async ( ) => mockState ),
    refresh: jest.fn( async ( ) => mockState ),
    addEventListener: jest.fn( subscribe ),
    useNetInfo: ( ) => mockReact.useSyncExternalStore( subscribe, ( ) => mockState ),
  };
  return { __esModule: true, default: mockNetInfo, ...mockNetInfo };
} );

// Analytics-only experiment that runs the on-device model on 1% of online
// requests; it would make on-device call counts random
jest.mock( "sharedHooks/useSuggestions/suggestionComparisonExperiment", ( ) => ( {
  startOfflineExperimentInBackground: jest.fn( ),
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

const world = makeWorld( );
const ALL_TAXA = Object.values( TAXA );
const realm = ( ) => global.mockRealms[mockRealmIdentifier];
const savedObservation = uuid => realm( ).objectForPrimaryKey( "Observation", uuid );

beforeAll( async ( ) => {
  await initI18next( );
  jest.useFakeTimers( );
  realm( ).write( ( ) => {
    ICONIC_TAXA.forEach( taxon => {
      realm( ).create( "Taxon", { ...taxon, isIconic: true }, "modified" );
    } );
  } );
} );

const actualHandleError = jest.requireActual( "api/error" ).default;

beforeEach( ( ) => {
  world.reset( );
  realm( ).write( ( ) => {
    realm( ).delete( realm( ).objects( "Taxon" ).filtered( "isIconic != true" ) );
  } );
  // Swallow the unawaited error-logging rejections already recorded as R-NET-05
  jest.spyOn( apiError, "default" ).mockImplementation( ( e, options ) => {
    const result = actualHandleError( e, options );
    if ( options?.throw === false ) {
      return result.catch( ( ) => undefined );
    }
    return result;
  } );
} );

afterEach( ( ) => {
  useStore.setState( { observations: [], currentObservation: null } );
} );

const actor = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

const CONFIDENT_RESULTS = [
  suggestion( TAXA.cupPlant, 95 ),
  suggestion( TAXA.compassPlant, 30 ),
  suggestion( TAXA.rosinweed, 20 ),
];

const showMatchWith = async ( observation, results, options ) => {
  world.setObservation( observation );
  const view = renderMatch( );
  await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
  await world.respondOnline( results, options );
  await waitFor( ( ) => expect( view.impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
  return view;
};

describe( "Bug hunt", ( ) => {
  // SUSPECTED BUG: addCameraRollUris pushes into the array it finds in the
  // store, and resetObservationFlowSlice puts the same DEFAULT_STATE array
  // back, so camera-roll copies pile up for the whole app session. Every Save
  // on Match then stamps the new observation's location into the EXIF of
  // every photo the app saved to the camera roll earlier.
  it( "B-01 saving a second observation rewrites the location of the first one's "
    + "camera-roll photo", async ( ) => {
    const { resetObservationFlowSlice, addCameraRollUris } = useStore.getState( );
    Exify.write.mockClear( );
    try {
      // First observation: AI camera at the trailhead, saved from Match
      resetObservationFlowSlice( ); // what the AI camera button does first
      addCameraRollUris( ["ph://trailhead-photo"] ); // the camera's photo-library copy
      const first = makeNewObservation( {
        latitude: 41.5, longitude: -93.6, positional_accuracy: 5,
      } );
      const firstVisit = await showMatchWith( first, CONFIDENT_RESULTS );
      await firstVisit.impl.pressSave( actor );
      await waitFor( ( ) => expect( firstVisit.currentRoute( ).name ).toBe( "TabNavigator" ) );
      expect( Exify.write ).toHaveBeenCalledTimes( 1 );
      screen.unmount( );

      // Second observation, somewhere else
      world.reset( );
      Exify.write.mockClear( );
      resetObservationFlowSlice( );
      expect( useStore.getState( ).cameraRollUris ).toEqual( ["ph://trailhead-photo"] );
      addCameraRollUris( ["ph://summit-photo"] );
      const second = makeNewObservation( {
        latitude: 44.2, longitude: -71.3, positional_accuracy: 5,
      } );
      const secondVisit = await showMatchWith( second, CONFIDENT_RESULTS );
      await secondVisit.impl.pressSave( actor );
      await waitFor( ( ) => expect( secondVisit.currentRoute( ).name ).toBe( "TabNavigator" ) );
      expect( Exify.write ).toHaveBeenCalledTimes( 2 );
      expect( Exify.write ).toHaveBeenCalledWith( "ph://trailhead-photo", expect.objectContaining( {
        GPSLatitude: 44.2,
        GPSLongitude: -71.3,
      } ) );
    } finally {
      // The leaked array is module-level state; empty it for later scenarios
      useStore.getState( ).resetObservationFlowSlice( );
      useStore.getState( ).cameraRollUris.splice( 0 );
    }
  } );

  // SUSPECTED BUG: once the first request times out, useOnlineSuggestions
  // keeps `timedOut` true for good and hides every online answer. The GPS fix
  // still makes the screen show "Analyzing" and ask the API again with the
  // location, but that answer is thrown away and the on-device guess stays.
  it( "B-02 after a slow first answer, the online answer asked for with the GPS "
    + "location is ignored", async ( ) => {
    const observation = makeNewObservation( );
    world.setObservation( observation );
    const { impl, currentRoute } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.advance( 5_000 );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );

    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 10, lng: 20 } );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    // The API answers the new request quickly and confidently
    await world.respondOnline( [suggestion( TAXA.rosinweed, 97 )], { call: 1 } );
    // The on-device model is run again with the location too
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.advance( 1_000 );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
    expect( impl.read( ALL_TAXA ).alternatives ).not.toContain( TAXA.rosinweed.id );

    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.compassPlant.id },
      latitude: 10,
      longitude: 20,
    } );
  } );

  // SUSPECTED BUG: the GPS watch is a focus effect and `needLocation` never
  // turns off, so coming back from the location picker starts GPS again and
  // the next fix silently replaces the location the person just picked
  it( "B-03 GPS failed, location picked by hand: coming back restarts GPS and the "
    + "next fix replaces the pick", async ( ) => {
    const observation = makeNewObservation( );
    const { impl, currentRoute, goBack } = await showMatchWith( observation, CONFIDENT_RESULTS );
    await world.failGps( );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).addLocationBusy ).toBe( false ) );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "LocationPicker" ) );
    await world.pickLocation( { latitude: 10, longitude: 20 } );
    await goBack( );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );
    expect( impl.read( ALL_TAXA ).map ).toBe( true );
    // GPS starts again even though the observation now has a location
    expect( world.gps.watching ).toBe( 2 );

    await world.deliverGpsFix( { latitude: 38.5, longitude: -123.2 } );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 38.5,
      longitude: -123.2,
      // ...while the picked place's name stays, so the two now disagree
      place_guess: "Picked place",
    } );
    // and the AI is asked again with the GPS position, not the pick
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 38.5, lng: -123.2 } );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );

    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      latitude: 38.5,
      longitude: -123.2,
    } );
  } );
} );
