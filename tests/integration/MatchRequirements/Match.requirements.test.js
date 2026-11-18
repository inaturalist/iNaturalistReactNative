// Requirements for the Match screen, written as what a person sees, where
// they end up, and what gets saved. Each scenario records today's (V1)
// behavior. When V2 runs these, a different outcome has to be written down as
// an explicit V2 expectation, not discovered.
//
// Scenarios tagged [bug] in their title enforce behavior that is probably
// wrong, on purpose: fixing it should be a deliberate change to the
// expectation. A SUSPECTED BUG comment on each explains the cause.
import * as Exify from "@lodev09/react-native-exify";
import {
  act, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import * as apiError from "api/error";
import { photoLibraryPhotosPath, rotatedOriginalPhotosPath } from "appConstants/paths";
import initI18next from "i18n/initI18next";
import Geocoder from "react-native-geocoder-reborn";
import { requestMultiple, RESULTS } from "react-native-permissions";
import { FIREBASE_TRACES } from "stores/createFirebaseTraceSlice";
import useStore from "stores/useStore";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

import { renderMatch } from "./matchHarness";
import {
  ICONIC_TAXA,
  makeNewObservation,
  makeObservationPhoto,
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

// Error logging that was told not to throw but rejected anyway, with nobody
// awaiting it. Collected here because Jest would otherwise fail the test on
// the unhandled rejection.
let unawaitedApiErrors = [];
const actualHandleError = jest.requireActual( "api/error" ).default;

beforeEach( ( ) => {
  world.reset( );
  // Online answers get cached as taxa, which changes how later offline
  // answers are named. Start every scenario with only the iconic taxa.
  realm( ).write( ( ) => {
    realm( ).delete( realm( ).objects( "Taxon" ).filtered( "isIconic != true" ) );
  } );
  unawaitedApiErrors = [];
  jest.spyOn( apiError, "default" ).mockImplementation( ( e, options ) => {
    const result = actualHandleError( e, options );
    if ( options?.throw === false ) {
      return result.catch( err => { unawaitedApiErrors.push( err ); } );
    }
    return result;
  } );
} );

afterEach( ( ) => {
  useStore.setState( { observations: [], currentObservation: null } );
} );

const actor = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

// Imported with good coordinates already, so the screen doesn't use GPS
const observationWithLocation = ( ) => makeNewObservation( {
  latitude: 41.5,
  longitude: -93.6,
  positional_accuracy: 5,
} );

const CONFIDENT_RESULTS = [
  suggestion( TAXA.cupPlant, 95 ),
  suggestion( TAXA.compassPlant, 30 ),
  suggestion( TAXA.rosinweed, 20 ),
];

// Render, wait for the first online request, answer it, and wait for the
// screen to finish analyzing
const showMatchWith = async ( observation, results, options ) => {
  world.setObservation( observation );
  const view = renderMatch( );
  await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
  await world.respondOnline( results, options );
  await waitFor( ( ) => expect( view.impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
  return view;
};

describe( "What the AI found", ( ) => {
  it( "R-RESULT-01 confident species: shows it as the match with its confidence", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You observed this species",
      top: { id: TAXA.cupPlant.id, confidence: 95 },
      alternativesHeading: "It might also be",
      alternatives: [TAXA.compassPlant.id, TAXA.rosinweed.id],
      groupPicker: false,
      learnMore: "species",
    } );
  } );

  it( "R-RESULT-02 species between 79 and 92: says “likely”", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 85 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You likely observed this species",
      top: { id: TAXA.cupPlant.id, confidence: 85 },
      alternatives: [],
      alternativesHeading: null,
    } );
  } );

  it( "R-RESULT-03 confident genus: talks about a group, not a species", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.silphium, 96 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You observed a species in this group",
      top: { id: TAXA.silphium.id, confidence: 96 },
      learnMore: "group",
    } );
  } );

  it( "R-RESULT-04 nothing above 78 but a common ancestor: the ancestor is the match "
    + "", async ( ) => {
    const { impl } = await showMatchWith(
      observationWithLocation( ),
      [suggestion( TAXA.compassPlant, 40 ), suggestion( TAXA.cupPlant, 50 )],
      { commonAncestor: { taxon: TAXA.silphium, score: 70 } },
    );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You likely observed a species in this group",
      top: { id: TAXA.silphium.id, confidence: 70 },
      alternativesHeading: "It might also be",
      alternatives: [TAXA.cupPlant.id, TAXA.compassPlant.id],
      learnMore: "group",
    } );
  } );

  it( "R-RESULT-05 no results at all: asks for the group", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "The AI is not confident. Upload to ask the community.",
      top: null,
      alternatives: [],
      groupPicker: true,
      learnMore: null,
    } );
  } );

  it( "R-RESULT-06 results but none confident and no ancestor: lists them with no match "
    + "", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.compassPlant, 40 ),
      suggestion( TAXA.cupPlant, 60 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "The AI is not confident. It may be one of the IDs below.",
      top: null,
      alternativesHeading: "It might be one of these",
      alternatives: [TAXA.cupPlant.id, TAXA.compassPlant.id],
      groupPicker: false,
      learnMore: null,
    } );
  } );

  it( "R-RESULT-07 a human anywhere in the results: shows only human", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 95 ),
      suggestion( TAXA.human, 50 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.human.id, confidence: 50 },
      alternatives: [],
    } );
  } );

  it( "R-RESULT-08 other suggestions are ordered by score, whatever order the API used "
    + "", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.rosinweed, 10 ),
      suggestion( TAXA.cupPlant, 95 ),
      suggestion( TAXA.compassPlant, 30 ),
    ] );
    expect( impl.read( ALL_TAXA ).alternatives ).toEqual( [
      TAXA.compassPlant.id,
      TAXA.rosinweed.id,
    ] );
  } );

  it( "R-RESULT-09 shows “Analyzing” until the AI answers", async ( ) => {
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
  } );
} );

describe( "Choosing and saving", ( ) => {
  it( "R-CHOOSE-01 tapping another suggestion makes it the match", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You may have observed this species",
      top: { id: TAXA.compassPlant.id, confidence: 30 },
      alternatives: [TAXA.cupPlant.id, TAXA.rosinweed.id],
    } );
  } );

  it( "R-SAVE-01 save keeps the match as an ID from the AI and leaves to My Observations "
    + "", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, CONFIDENT_RESULTS );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.cupPlant.id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-SAVE-02 save after choosing another suggestion keeps that one", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, CONFIDENT_RESULTS );
    await impl.chooseAlternative( actor, TAXA.rosinweed );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.rosinweed.id ) );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.rosinweed.id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-SAVE-03 save with no results and no group chosen saves without an ID", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [] );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    const saved = savedObservation( observation.uuid );
    expect( saved ).toBeTruthy( );
    expect( saved.taxon ).toBeFalsy( );
    expect( saved.owners_identification_from_vision ).toBe( false );
  } );

  it( "R-SAVE-04 choosing a group then saving saves the group, not as an AI ID", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [] );
    await impl.chooseGroup( actor, ICONIC_TAXA[0] );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: ICONIC_TAXA[0].id },
      owners_identification_from_vision: false,
    } );
  } );

  it( "R-SAVE-05 choosing from an unconfident list then saving counts as an AI ID", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [
      suggestion( TAXA.compassPlant, 40 ),
      suggestion( TAXA.cupPlant, 60 ),
    ] );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.compassPlant.id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-SAVE-06 discard saves nothing and leaves to My Observations", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, CONFIDENT_RESULTS );
    await impl.pressDiscard( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toBeFalsy( );
  } );

  // SUSPECTED BUG: addCameraRollUris pushes into the array it finds in the
  // store, and resetObservationFlowSlice puts the same DEFAULT_STATE array
  // back, so camera-roll copies pile up for the whole app session. Every Save
  // on Match then stamps the new observation's location into the EXIF of
  // every photo the app saved to the camera roll earlier.
  it( "B-01 [bug] saving a second observation rewrites the location of the first one's "
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
} );

describe( "Leaving to other screens", ( ) => {
  it( "R-NAV-01 “Learn more” opens the match's taxon page", async ( ) => {
    const { impl, currentRoute } = await showMatchWith(
      observationWithLocation( ),
      CONFIDENT_RESULTS,
    );
    await impl.pressLearnMore( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    expect( currentRoute( ).params ).toMatchObject( { id: TAXA.cupPlant.id } );
  } );

  it( "R-NAV-02 “Learn more” after choosing another suggestion opens that one", async ( ) => {
    const { impl, currentRoute } = await showMatchWith(
      observationWithLocation( ),
      CONFIDENT_RESULTS,
    );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    await impl.pressLearnMore( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    expect( currentRoute( ).params ).toMatchObject( { id: TAXA.compassPlant.id } );
  } );

  it( "R-NAV-03 edit opens ObsEdit with the match filled in as an AI ID", async ( ) => {
    const { impl, currentRoute } = await showMatchWith(
      observationWithLocation( ),
      CONFIDENT_RESULTS,
    );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    expect( currentRoute( ).params ).toMatchObject( { lastScreen: "Match" } );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      taxon: { id: TAXA.cupPlant.id },
      owners_identification_from_vision: true,
    } );
  } );
} );

describe( "Network", ( ) => {
  it( "R-NET-01 offline from the start: uses the on-device model and never calls the API "
    + "", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [
      prediction( TAXA.cupPlant, 95 ),
      prediction( TAXA.compassPlant, 30 ),
    ] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( world.onlineCalls( ) ).toHaveLength( 0 );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You observed this species",
      // Never seen before, so only the scientific name is known
      top: { id: TAXA.cupPlant.id, confidence: 95, showsCommonName: false },
      alternatives: [TAXA.compassPlant.id],
      learnMore: null,
    } );
  } );

  it( "R-NET-02 offline and the on-device model finds nothing: asks for the group", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "The AI is not confident. Upload to ask the community.",
      top: null,
      groupPicker: true,
    } );
  } );

  it( "R-NET-03 API slower than 5 seconds: falls back to the on-device model", async ( ) => {
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.advance( 5_000 );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
  } );

  it( "R-NET-04 API answers after the fallback: the on-device answer stays", async ( ) => {
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.advance( 5_000 );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await world.respondOnline( CONFIDENT_RESULTS, { call: 0 } );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
  } );

  it( "R-NET-05 [bug] API errors (500): tries 3 times over about 4 seconds, then uses the "
    + "on-device model", async ( ) => {
    world.onlineAlwaysFails( 500 );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await world.advance( 2_500 );
    expect( world.onlineCalls( ) ).toHaveLength( 2 );
    expect( world.offlineCalls( ) ).toHaveLength( 0 );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    await world.advance( 2_000 );
    expect( world.onlineCalls( ) ).toHaveLength( 3 );
    expect( world.offlineCalls( ) ).toHaveLength( 1 );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.compassPlant.id },
      learnMore: "species",
    } );
    // SUSPECTED BUG: each failed attempt starts error logging that rejects
    // with nobody waiting on it (reactQueryRetry → handleError)
    expect( unawaitedApiErrors ).toHaveLength( 3 );
  } );

  it( "R-NET-05b API down (503): uses the on-device model right away, no retries", async ( ) => {
    world.onlineAlwaysFails( 503 );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
    expect( unawaitedApiErrors ).toHaveLength( 0 );
  } );

  it( "R-NET-06 connection drops while the API is working: falls back right away", async ( ) => {
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.setNetwork( false );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.compassPlant.id },
      learnMore: null,
    } );
  } );

  // SUSPECTED BUG: the hook rethrows the model's error during render, and
  // main has no error boundary, so in the app this takes the whole app down
  it( "R-NET-07 [bug] offline and the on-device model fails: the screen crashes", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.failOffline( );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).crashed ).toBe( true ) );
  } );

  // SUSPECTED BUG: losing the connection throws away an online answer the
  // person is already looking at
  it( "R-NET-08 [bug] connection drops while a result is showing: "
    + "the result is replaced", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    await world.setNetwork( false );
    // Briefly looks like nothing was found, with no “Analyzing” overlay
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      analyzing: false,
      verdict: "The AI is not confident. Upload to ask the community.",
      top: null,
      groupPicker: true,
    } );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    // Coming back online doesn't bring the online answer back
    await world.setNetwork( true );
    await world.advance( 1_000 );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
  } );

  it( "R-NET-09 offline: names come from taxa the app has seen before", async ( ) => {
    realm( ).write( ( ) => {
      realm( ).create( "Taxon", {
        id: TAXA.cupPlant.id,
        name: TAXA.cupPlant.name,
        preferred_common_name: TAXA.cupPlant.preferred_common_name,
        rank: TAXA.cupPlant.rank,
        rank_level: TAXA.cupPlant.rank_level,
      }, "modified" );
    } );
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.cupPlant, 95 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( {
      id: TAXA.cupPlant.id,
      showsCommonName: true,
    } );
  } );

  // SUSPECTED BUG: once the first request times out, useOnlineSuggestions
  // keeps `timedOut` true for good and hides every online answer. The GPS fix
  // still makes the screen show "Analyzing" and ask the API again with the
  // location, but that answer is thrown away and the on-device guess stays.
  it( "B-02 [bug] after a slow first answer, the online answer asked for with the GPS "
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
} );

describe( "Location", ( ) => {
  it( "R-LOC-01 observation already has a location: sends it with the photo, no GPS", async ( ) => {
    await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    expect( world.onlineCalls( )[0] ).toMatchObject( { lat: 41.5, lng: -93.6 } );
    expect( world.gps.watching ).toBe( 0 );
  } );

  it( "R-LOC-02 new photo without location: asks the AI first, then again once GPS "
    + "answers", async ( ) => {
    const observation = makeNewObservation( );
    world.setObservation( observation );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.onlineCalls( )[0].lat ).toBeUndefined( );
    expect( world.gps.watching ).toBe( 1 );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 10, lng: 20 } );
    await world.respondOnline( [suggestion( TAXA.rosinweed, 97 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.rosinweed.id ) );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 10, longitude: 20,
    } );
  } );

  it( "R-LOC-03 GPS answers before the AI does: asks again with the location", async ( ) => {
    world.setObservation( makeNewObservation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 10, lng: 20 } );
    await world.respondOnline( [suggestion( TAXA.rosinweed, 97 )], { call: 1 } );
    await world.respondOnline( CONFIDENT_RESULTS, { call: 0 } );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.rosinweed.id } );
  } );

  it( "R-LOC-04 GPS keeps improving: the location updates but the AI is only asked again "
    + "once", async ( ) => {
    world.setObservation( makeNewObservation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20, accuracy: 60 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    await world.respondOnline( CONFIDENT_RESULTS );
    await world.deliverGpsFix( { latitude: 11, longitude: 21, accuracy: 30 } );
    await world.deliverGpsFix( { latitude: 12, longitude: 22, accuracy: 5 } );
    await world.advance( 1_000 );
    expect( world.onlineCalls( ) ).toHaveLength( 2 );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 12, longitude: 22,
    } );
  } );

  it( "R-LOC-05 connection drops while GPS is still fixing: the on-device model runs "
    + "again with the location", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await world.setNetwork( false );
    await waitFor( ( ) => expect( world.offlineCalls( ).length ).toBeGreaterThan( 0 ) );
    expect( world.offlineCalls( )[0].location ).toBeUndefined( );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    const runsBeforeFix = world.offlineCalls( ).length;
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.offlineCalls( ).length ).toBeGreaterThan( runsBeforeFix ) );
    expect( world.offlineCalls( ).at( -1 ).location ).toEqual( { latitude: 10, longitude: 20 } );
    await world.respondOffline( [prediction( TAXA.rosinweed, 92 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.rosinweed.id ) );
    // Surprising: it also sends the API a second request while offline
    expect( world.onlineCalls( ) ).toHaveLength( 2 );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 10, lng: 20 } );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 10, longitude: 20,
    } );
  } );

  // SUSPECTED BUG: the GPS answer is ignored until a photo upload has been
  // prepared, which never happens offline, so the observation is saved
  // without the location the phone found
  it( "R-LOC-06 [bug] offline from the start: the GPS location is never added to the "
    + "observation", async ( ) => {
    world.setNetwork( false );
    const observation = makeNewObservation( );
    world.setObservation( observation );
    const { impl, currentRoute } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.cupPlant, 95 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( world.gps.watching ).toBe( 1 );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation.latitude ).toBeUndefined( );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ).latitude ).toBeNull( );
  } );

  it( "R-LOC-07 no location permission: asks the AI without location and offers to add "
    + "one", async ( ) => {
    world.denyLocationPermission( );
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    expect( world.onlineCalls( )[0].lat ).toBeUndefined( );
    expect( world.gps.watching ).toBe( 0 );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      addLocationButton: true,
      locationPermissionPrompt: false,
    } );
  } );

  it( "R-LOC-08 add location without permission, then grant it: uses GPS and asks the AI "
    + "again", async ( ) => {
    world.denyLocationPermission( );
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).locationPermissionPrompt ).toBe( true ) );
    requestMultiple.mockImplementationOnce( async permissions => permissions.reduce(
      ( acc, permission ) => ( { ...acc, [permission]: RESULTS.GRANTED } ),
      {},
    ) );
    await actor.press( screen.getByText( "USE LOCATION" ) );
    await waitFor( ( ) => expect( world.gps.watching ).toBe( 1 ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 10, lng: 20 } );
  } );

  it( "R-LOC-09 add location without permission, then close the prompt: opens the "
    + "location picker", async ( ) => {
    world.denyLocationPermission( );
    const { impl, currentRoute } = await showMatchWith(
      makeNewObservation( ),
      CONFIDENT_RESULTS,
    );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).locationPermissionPrompt ).toBe( true ) );
    await actor.press( screen.getByTestId( "close-permission-gate" ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "LocationPicker" ) );
  } );

  it( "R-LOC-10 camera photo with an imprecise location: asks with it, then again with "
    + "a better GPS fix", async ( ) => {
    const observation = makeNewObservation( {
      latitude: 41.5,
      longitude: -93.6,
      positional_accuracy: 80,
      observationPhotos: [makeObservationPhoto(
        "photoUploads/camera.jpg",
        `${rotatedOriginalPhotosPath}/camera.jpg`,
      )],
    } );
    world.setObservation( observation );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.onlineCalls( )[0] ).toMatchObject( { lat: 41.5, lng: -93.6 } );
    expect( world.gps.watching ).toBe( 1 );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.deliverGpsFix( { latitude: 41.51, longitude: -93.61, accuracy: 5 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( world.onlineCalls( )[1] ).toMatchObject( { lat: 41.51, lng: -93.61 } );
  } );

  it( "R-LOC-11 photo imported without a location: no GPS; “Add location” opens the "
    + "location picker", async ( ) => {
    const observation = makeNewObservation( {
      observationPhotos: [makeObservationPhoto(
        "photoUploads/gallery.jpg",
        `${photoLibraryPhotosPath}/gallery.jpg`,
      )],
    } );
    const { impl, currentRoute } = await showMatchWith( observation, CONFIDENT_RESULTS );
    expect( world.gps.watching ).toBe( 0 );
    expect( impl.read( ALL_TAXA ).addLocationButton ).toBe( true );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "LocationPicker" ) );
  } );

  // SUSPECTED BUG: the place name is looked up with the location from before
  // the fix that triggered it, so it is missing after one fix and one fix
  // behind after more
  it( "R-LOC-12 [bug] GPS answers: the place name lags one fix behind", async ( ) => {
    Geocoder.geocodePosition.mockImplementation( ( { lat } ) => Promise.resolve( [
      lat === 38.51
        ? { locality: "Fort Ross", adminArea: "CA", countryCode: "US" }
        : { locality: "Jenner", adminArea: "CA", countryCode: "US" },
    ] ) );
    await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await world.deliverGpsFix( { latitude: 38.51, longitude: -123.24, accuracy: 30 } );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation.place_guess ).toBeUndefined( );
    await world.deliverGpsFix( { latitude: 38.45, longitude: -123.12, accuracy: 5 } );
    await waitFor( ( ) => expect(
      useStore.getState( ).currentObservation.place_guess,
    ).toBe( "Fort Ross, CA, US" ) );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 38.45, longitude: -123.12,
    } );
  } );

  it( "R-LOC-13 leaving Match stops GPS; coming back starts it again", async ( ) => {
    const {
      impl, currentRoute, goBack,
    } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    expect( world.gps.watching ).toBe( 1 );
    await impl.pressLearnMore( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    await goBack( );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );
    await waitFor( ( ) => expect( world.gps.watching ).toBe( 2 ) );
  } );

  // SUSPECTED BUG: the GPS watch is a focus effect and `needLocation` never
  // turns off, so coming back from the location picker starts GPS again and
  // the next fix silently replaces the location the person just picked
  it( "B-03 [bug] GPS failed, location picked by hand: coming back restarts GPS and the "
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

describe( "Coming back and changing your mind", ( ) => {
  it( "R-NAV-04 back from the taxon page: same match, no new AI request", async ( ) => {
    const {
      impl, currentRoute, goBack,
    } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    await impl.pressLearnMore( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    await goBack( );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
  } );

  it( "R-CHOOSE-02 a chosen suggestion stays chosen when GPS brings new results "
    + "that include it", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    await world.respondOnline( [
      suggestion( TAXA.rosinweed, 96 ),
      suggestion( TAXA.compassPlant, 40 ),
    ] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( {
      id: TAXA.compassPlant.id, confidence: 40,
    } );
  } );

  // SUSPECTED BUG: the screen keeps looking for the earlier pick, finds
  // nothing, and shows no match even though the new results have a confident one
  it( "R-CHOOSE-03 [bug] a chosen suggestion missing from the new GPS results: no match shown "
    + "", async ( ) => {
    const observation = makeNewObservation( );
    const { impl, currentRoute } = await showMatchWith( observation, CONFIDENT_RESULTS );
    await impl.chooseAlternative( actor, TAXA.compassPlant );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.compassPlant.id ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    await world.respondOnline( [
      suggestion( TAXA.rosinweed, 96 ),
      suggestion( TAXA.cupPlant, 40 ),
    ] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "The AI is not confident. It may be one of the IDs below.",
      top: null,
      alternatives: [TAXA.rosinweed.id, TAXA.cupPlant.id],
    } );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ).taxon ).toBeFalsy( );
  } );

  // SUSPECTED BUG: a group the person picked goes to ObsEdit marked as the
  // AI's ID, while saving the same pick from Match marks it as theirs
  it( "R-NAV-05 [bug] edit after picking a group: "
    + "ObsEdit gets the group as an AI ID", async ( ) => {
    const { impl, currentRoute } = await showMatchWith( observationWithLocation( ), [] );
    await impl.chooseGroup( actor, ICONIC_TAXA[0] );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      taxon: { id: ICONIC_TAXA[0].id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-CHOOSE-04 picking a different group replaces the first pick", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [] );
    await impl.chooseGroup( actor, ICONIC_TAXA[0] );
    await impl.chooseGroup( actor, ICONIC_TAXA[1] );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: ICONIC_TAXA[1].id },
    } );
  } );

  it( "R-CHOOSE-05 a group picked before GPS brings results loses to the AI's match", async ( ) => {
    const observation = makeNewObservation( );
    const { impl, currentRoute } = await showMatchWith( observation, [] );
    await impl.chooseGroup( actor, ICONIC_TAXA[1] );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).top?.id ).toBe( TAXA.cupPlant.id ) );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.cupPlant.id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-NAV-06 edit with an unconfident list and nothing chosen: ObsEdit has no ID", async ( ) => {
    const { impl, currentRoute } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.compassPlant, 40 ),
    ] );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    expect( useStore.getState( ).currentObservation.taxon ).toBeFalsy( );
  } );

  it( "R-SAVE-07 a human match is saved as an AI ID", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [
      suggestion( TAXA.human, 90 ),
    ] );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toMatchObject( {
      taxon: { id: TAXA.human.id },
      owners_identification_from_vision: true,
    } );
  } );

  it( "R-SAVE-08 save writes the observation's location into photos also saved to the "
    + "camera roll", async ( ) => {
    useStore.setState( { cameraRollUris: ["ph://camera-roll-copy"] } );
    const { impl, currentRoute } = await showMatchWith(
      observationWithLocation( ),
      CONFIDENT_RESULTS,
    );
    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( Exify.write ).toHaveBeenCalledWith( "ph://camera-roll-copy", expect.objectContaining( {
      GPSLatitude: 41.5,
      GPSLongitude: -93.6,
    } ) );
  } );
} );

describe( "Requests, caching and measurement", ( ) => {
  it( "R-REQ-01 signed out: the AI request names the app's language", async ( ) => {
    await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    expect( world.onlineCalls( )[0] ).toMatchObject( { locale: "en" } );
  } );

  it( "R-REQ-02 signed in: the AI request leaves the language to the account", async ( ) => {
    realm( ).write( ( ) => {
      realm( ).create( "User", { id: 1, login: "signedin", signedIn: true }, "modified" );
    } );
    try {
      await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
      expect( world.onlineCalls( )[0].locale ).toBeUndefined( );
    } finally {
      realm( ).write( ( ) => realm( ).delete( realm( ).objects( "User" ) ) );
    }
  } );

  it( "R-REQ-03 only the first photo is identified", async ( ) => {
    world.setNetwork( false );
    world.setObservation( makeNewObservation( {
      latitude: 41.5,
      longitude: -93.6,
      observationPhotos: [
        makeObservationPhoto( "photoUploads/first.jpg" ),
        makeObservationPhoto( "photoUploads/second.jpg" ),
      ],
    } ) );
    renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.offlineCalls( )[0].uri ).toMatch( /first\.jpg$/ );
  } );

  it( "R-REQ-04 online results are kept on the device, so they have names offline later "
    + "", async ( ) => {
    await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    const cached = realm( ).objectForPrimaryKey( "Taxon", TAXA.compassPlant.id );
    expect( cached ).toMatchObject( { preferred_common_name: "Compass Plant" } );
  } );

  it( "R-REQ-05 no AI request until the location permission check finishes", async ( ) => {
    const { checkMultiple } = jest.requireMock( "react-native-permissions" );
    let finishCheck;
    checkMultiple.mockImplementationOnce( permissions => new Promise( resolve => {
      finishCheck = ( ) => resolve( permissions.reduce(
        ( acc, permission ) => ( { ...acc, [permission]: RESULTS.GRANTED } ),
        {},
      ) );
    } ) );
    world.setObservation( observationWithLocation( ) );
    renderMatch( );
    await world.advance( 2_000 );
    expect( world.onlineCalls( ) ).toHaveLength( 0 );
    await world.advance( 0 );
    finishCheck( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
  } );

  it( "R-PERF-01 reports “AI camera to Match” once, marked online", async ( ) => {
    const stopFirebaseTrace = jest.fn( );
    useStore.setState( { stopFirebaseTrace } );
    await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    await world.advance( 500 );
    expect( stopFirebaseTrace ).toHaveBeenCalledWith(
      FIREBASE_TRACES.AI_CAMERA_TO_MATCH,
      { online: "true" },
    );
  } );

  it( "R-PERF-02 reports “AI camera to Match” marked offline after a fallback", async ( ) => {
    const stopFirebaseTrace = jest.fn( );
    useStore.setState( { stopFirebaseTrace } );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.advance( 5_000 );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( stopFirebaseTrace ).toHaveBeenLastCalledWith(
      FIREBASE_TRACES.AI_CAMERA_TO_MATCH,
      { online: "false" },
    );
  } );
} );

describe( "Deeper: photos, map, and returning with a location", ( ) => {
  it( "R-PHOTO-01 tapping the observation photo opens the media viewer", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    expect( impl.read( ALL_TAXA ).mediaViewerOpen ).toBe( false );
    await impl.pressObservationPhoto( actor );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).mediaViewerOpen ).toBe( true ) );
  } );

  it( "R-PHOTO-02 more than one photo: shows how many", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( {
      latitude: 41.5,
      longitude: -93.6,
      observationPhotos: [
        makeObservationPhoto( "photoUploads/first.jpg" ),
        makeObservationPhoto( "photoUploads/second.jpg" ),
        makeObservationPhoto( "photoUploads/third.jpg" ),
      ],
    } ), CONFIDENT_RESULTS );
    expect( impl.read( ALL_TAXA ).photoCount ).toBe( 3 );
  } );

  it( "R-MAP-01 observation with a location: shows the map, no “Add location”", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( { map: true, addLocationButton: false } );
  } );

  it( "R-MAP-02 no location yet: no map, “Add location” is busy while GPS works", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      map: false,
      addLocationButton: true,
      addLocationBusy: true,
    } );
  } );

  it( "R-MAP-03 GPS fails: “Add location” stops being busy and nothing is asked again "
    + "", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await world.failGps( );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).addLocationBusy ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).addLocationButton ).toBe( true );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
  } );

  it( "R-RESULT-10 asking again after GPS shows “Analyzing” over the earlier answer", async ( ) => {
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
  } );

  // SUSPECTED BUG: the button says the location gives better IDs, but a
  // location picked by hand is never sent to the AI
  it( "R-LOC-14 [bug] location picked by hand: the map appears but the AI isn't asked again "
    + "", async ( ) => {
    world.denyLocationPermission( );
    const { impl, currentRoute, goBack } = await showMatchWith(
      makeNewObservation( ),
      CONFIDENT_RESULTS,
    );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).locationPermissionPrompt ).toBe( true ) );
    await actor.press( screen.getByTestId( "close-permission-gate" ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "LocationPicker" ) );
    // What the location picker's Save does
    await world.pickLocation( { latitude: 10, longitude: 20 } );
    await goBack( );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );
    await world.advance( 1_000 );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( { map: true, addLocationButton: false } );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
  } );
} );

describe( "Deeper: the on-device model", ( ) => {
  // SUSPECTED BUG: the location only reaches the model through the online
  // request's parameters, which are never prepared offline
  it( "R-NET-10 [bug] offline from the start: the on-device model ignores the observation's "
    + "location", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.offlineCalls( )[0] ).toMatchObject( {
      useGeomodel: false,
      location: undefined,
    } );
  } );

  it( "R-NET-10b falling back after an online attempt: the on-device model uses the "
    + "location", async ( ) => {
    world.setObservation( observationWithLocation( ) );
    renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.advance( 5_000 );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    expect( world.offlineCalls( )[0] ).toMatchObject( {
      useGeomodel: true,
      location: { latitude: 41.5, longitude: -93.6 },
    } );
  } );

  it( "R-NET-11 offline, nothing confident but a common ancestor: the ancestor is the "
    + "match", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline(
      [prediction( TAXA.cupPlant, 50 ), prediction( TAXA.compassPlant, 40 )],
      { commonAncestor: prediction( TAXA.silphium, 75 ) },
    );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.silphium.id, confidence: 75 },
      alternatives: [TAXA.cupPlant.id, TAXA.compassPlant.id],
    } );
  } );

  it( "R-NET-12 offline, a human among the predictions: shows only human", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [
      prediction( TAXA.cupPlant, 95 ),
      prediction( TAXA.human, 60 ),
    ] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.human.id },
      alternatives: [],
    } );
  } );

  it( "R-NET-13 offline from the start, then the connection returns: the API is never "
    + "asked", async ( ) => {
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.cupPlant, 95 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.setNetwork( true );
    await world.advance( 6_000 );
    expect( world.onlineCalls( ) ).toHaveLength( 0 );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: { id: TAXA.cupPlant.id },
      learnMore: "species",
    } );
  } );
} );

describe( "Third pass: edges", ( ) => {
  it( "R-NAV-07 back from Match: returns to the camera and saves nothing", async ( ) => {
    const observation = observationWithLocation( );
    world.setObservation( observation );
    const { impl, currentRoute, goBack } = renderMatch( { from: "Camera" } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOnline( CONFIDENT_RESULTS );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await goBack( );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Camera" ) );
    expect( savedObservation( observation.uuid ) ).toBeFalsy( );
  } );

  it( "R-NAV-08 “Learn more” on a common-ancestor match opens the ancestor's page", async ( ) => {
    const { impl, currentRoute } = await showMatchWith(
      observationWithLocation( ),
      [suggestion( TAXA.cupPlant, 50 )],
      { commonAncestor: { taxon: TAXA.silphium, score: 70 } },
    );
    await impl.pressLearnMore( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    expect( currentRoute( ).params ).toMatchObject( { id: TAXA.silphium.id } );
  } );

  it( "R-RESULT-11 confidence shows one decimal; wording uses the rounded value", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 92.96 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You observed this species",
      top: { id: TAXA.cupPlant.id, confidence: 93 },
    } );
  } );

  it( "R-RESULT-12 a fractional score shows with one decimal", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 85.27 ),
    ] );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { confidence: 85.3 } );
  } );

  it( "R-SAVE-09 discard while still analyzing: leaves, and the late answer is harmless "
    + "", async ( ) => {
    const observation = observationWithLocation( );
    world.setObservation( observation );
    const { impl, currentRoute } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    await impl.pressDiscard( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    await world.respondOnline( CONFIDENT_RESULTS );
    await world.advance( 1_000 );
    expect( savedObservation( observation.uuid ) ).toBeFalsy( );
    expect( currentRoute( ).name ).toBe( "TabNavigator" );
  } );

  it( "R-LOC-15 imported photo, location allowed on Match: GPS gives it the current "
    + "location", async ( ) => {
    world.denyLocationPermission( );
    const observation = makeNewObservation( {
      observationPhotos: [makeObservationPhoto(
        "photoUploads/old.jpg",
        `${photoLibraryPhotosPath}/old.jpg`,
      )],
    } );
    const { impl } = await showMatchWith( observation, CONFIDENT_RESULTS );
    expect( world.gps.watching ).toBe( 0 );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).locationPermissionPrompt ).toBe( true ) );
    requestMultiple.mockImplementationOnce( async permissions => permissions.reduce(
      ( acc, permission ) => ( { ...acc, [permission]: RESULTS.GRANTED } ),
      {},
    ) );
    await actor.press( screen.getByText( "USE LOCATION" ) );
    await waitFor( ( ) => expect( world.gps.watching ).toBe( 1 ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 10, longitude: 20,
    } );
  } );

  // SUSPECTED BUG: the stop waits for an online attempt that never happens,
  // so offline visits end only by the trace's own 10 second timeout and are
  // reported as timeouts
  it( "R-PERF-03 [bug] offline from the start: "
    + "the performance trace is never stopped", async ( ) => {
    const stopFirebaseTrace = jest.fn( );
    useStore.setState( { stopFirebaseTrace } );
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.cupPlant, 95 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    await world.advance( 2_000 );
    expect( stopFirebaseTrace ).not.toHaveBeenCalled( );
  } );
} );

describe( "Fourth pass: boundaries and stale data", ( ) => {
  it( "R-RESULT-13 the match threshold is strictly above 78", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 78 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      top: null,
      alternatives: [TAXA.cupPlant.id],
    } );
  } );

  it( "R-RESULT-13b a score just above 78 is a match, shown as 78%", async ( ) => {
    const { impl } = await showMatchWith( observationWithLocation( ), [
      suggestion( TAXA.cupPlant, 78.04 ),
    ] );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "You likely observed this species",
      top: { id: TAXA.cupPlant.id, confidence: 78 },
    } );
  } );

  it( "R-RESULT-14 no results but a common ancestor: treated as no results", async ( ) => {
    const { impl } = await showMatchWith(
      observationWithLocation( ),
      [],
      { commonAncestor: { taxon: TAXA.silphium, score: 70 } },
    );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( {
      verdict: "The AI is not confident. Upload to ask the community.",
      top: null,
      groupPicker: true,
    } );
  } );

  // SUSPECTED BUG: the device's stored taxon is merged over the API's, so an
  // outdated stored name wins, even though the fresh one is then saved
  it( "R-RESULT-15 [bug] a name stored on the device beats "
    + "the fresh one from the API", async ( ) => {
    realm( ).write( ( ) => {
      realm( ).create( "Taxon", {
        id: TAXA.cupPlant.id,
        name: TAXA.cupPlant.name,
        preferred_common_name: "Old Cached Name",
        rank: "species",
        rank_level: 10,
      }, "modified" );
    } );
    await showMatchWith( observationWithLocation( ), CONFIDENT_RESULTS );
    await world.advance( 2_000 );
    const cached = screen.queryAllByText( "Old Cached Name" ).length > 0;
    const fresh = screen.queryAllByText( "Cup Plant" ).length > 0;
    expect( { cached, fresh } ).toEqual( { cached: true, fresh: false } );
    // The fresh name does reach the device afterwards
    expect( realm( ).objectForPrimaryKey( "Taxon", TAXA.cupPlant.id ) ).toMatchObject( {
      preferred_common_name: "Cup Plant",
    } );
  } );

  it( "R-LOC-17 a GPS position more than a minute old is ignored", async ( ) => {
    await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    await world.deliverGpsFix( { latitude: 10, longitude: 20, ageMs: 61_000 } );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation.latitude ).toBeUndefined( );
    expect( world.onlineCalls( ) ).toHaveLength( 1 );
  } );

  it( "R-LOC-18 location previously denied and blocked: the prompt points to "
    + "settings", async ( ) => {
    world.blockLocationPermission( );
    const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
    expect( world.gps.watching ).toBe( 0 );
    await impl.pressAddLocation( actor );
    await waitFor( ( ) => expect(
      screen.getByText( /previously denied location permissions/ ),
    ).toBeVisible( ) );
  } );

  it( "R-PHOTO-03 tapping the match's representative photo opens its taxon page with "
    + "that photo", async ( ) => {
    const representativePhoto = { id: 9001, url: "https://static.example/9001/medium.jpg" };
    const taxonWithPhoto = { ...TAXA.cupPlant, representative_photo: representativePhoto };
    const { currentRoute } = await showMatchWith( observationWithLocation( ), [
      suggestion( taxonWithPhoto, 95 ),
    ] );
    const photo = await screen.findByTestId( `TaxonDetails.photo.${representativePhoto.id}` );
    await actor.press( photo );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    // Surprising: with none of the taxon's own photos on the device, its
    // representative photo is passed as if it belonged to another taxon
    expect( currentRoute( ).params ).toEqual( {
      id: TAXA.cupPlant.id,
      representativePhoto: { ...representativePhoto, isRepresentativeButOtherTaxon: true },
    } );
  } );
} );

describe( "Fifth pass: taxa already stored on the device", ( ) => {
  const storeCupPlantWithPhoto = ( ) => realm( ).write( ( ) => {
    realm( ).create( "Taxon", {
      id: TAXA.cupPlant.id,
      name: TAXA.cupPlant.name,
      preferred_common_name: TAXA.cupPlant.preferred_common_name,
      rank: "species",
      rank_level: 10,
      ancestor_ids: [47126, TAXA.cupPlant.id],
      default_photo: { id: 501, url: "https://static.example/501/square.jpg" },
    }, "modified" );
  } );

  // SUSPECTED BUG: the photo area reads `defaultPhoto`, but stored taxa expose
  // `default_photo`, and an empty stored photo list skips the fallback anyway
  it( "R-PHOTO-04 [bug] offline: a stored taxon's photo is never shown beside the observation "
    + "photo", async ( ) => {
    storeCupPlantWithPhoto( );
    world.setNetwork( false );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.offlineCalls( ) ).toHaveLength( 1 ) );
    await world.respondOffline( [prediction( TAXA.cupPlant, 95 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( {
      id: TAXA.cupPlant.id, showsCommonName: true,
    } );
    expect( screen.getByTestId( "MatchScreen.ObsPhoto" ) ).toBeVisible( );
    expect( screen.queryByTestId( "TaxonDetails.photo.501" ) ).toBeNull( );
  } );

  // SUSPECTED BUG: the API's taxon_photos never reach the device's taxonPhotos
  // and the API's default_photo is read as defaultPhoto, so only the
  // representative photo is ever available and the 2 and 3 photo layouts
  // never appear
  it( "R-PHOTO-05 [bug] online with a representative, a default and 3 taxon photos: only "
    + "1 taxon photo shows", async ( ) => {
    const taxonWithPhotos = {
      ...TAXA.cupPlant,
      ancestor_ids: [47126, TAXA.cupPlant.id],
      representative_photo: { id: 9001, url: "https://static.example/9001/medium.jpg" },
      default_photo: { id: 501, url: "https://static.example/501/square.jpg" },
      taxon_photos: [
        { photo: { id: 601, url: "https://static.example/601/medium.jpg" } },
        { photo: { id: 602, url: "https://static.example/602/medium.jpg" } },
        { photo: { id: 603, url: "https://static.example/603/medium.jpg" } },
      ],
    };
    await showMatchWith( observationWithLocation( ), [suggestion( taxonWithPhotos, 95 )] );
    await screen.findByTestId( "TaxonDetails.photo.9001" );
    expect( screen.queryAllByTestId( /^TaxonDetails\.photo\.\d+$/ ) ).toHaveLength( 1 );
    const stored = realm( ).objectForPrimaryKey( "Taxon", TAXA.cupPlant.id );
    expect( stored.taxonPhotos ).toHaveLength( 0 );
  } );

  it( "R-SAVE-10 with a stored copy of the taxon, Edit still gets the API's copy, "
    + "readable after the re-save", async ( ) => {
    storeCupPlantWithPhoto( );
    const cupPlantFromApi = {
      ...TAXA.cupPlant,
      ancestor_ids: [47126, TAXA.cupPlant.id],
      default_photo: { id: 501, url: "https://static.example/501/square.jpg" },
    };
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith( observation, [
      suggestion( cupPlantFromApi, 95 ),
    ] );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    // The API's plain copy, still readable after the stored taxon was re-saved
    expect( useStore.getState( ).currentObservation.taxon.default_photo.url )
      .toBe( "https://static.example/501/square.jpg" );
  } );
} );

describe( "Sixth pass", ( ) => {
  it( "R-RESULT-16 the AI camera's own guess isn't shown while Match analyzes", async ( ) => {
    useStore.setState( {
      aICameraSuggestion: suggestion( TAXA.cupPlant, 90 ),
    } );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( impl.read( ALL_TAXA ).analyzing ).toBe( true );
    expect( screen.queryAllByText( "Cup Plant" ) ).toHaveLength( 0 );
  } );

  it( "R-LOC-19 blocked location, open Settings from the prompt, allow, come back: GPS "
    + "starts", async ( ) => {
    const { AppState } = jest.requireActual( "react-native" );
    const originalState = AppState.currentState;
    AppState.currentState = "active";
    // Only listeners added in this scenario; earlier ones belong to unmounted screens
    const listenersBefore = AppState.addEventListener.mock.calls.length;
    try {
      world.blockLocationPermission( );
      const { impl } = await showMatchWith( makeNewObservation( ), CONFIDENT_RESULTS );
      await impl.pressAddLocation( actor );
      await waitFor( ( ) => expect(
        screen.getByText( /previously denied location permissions/ ),
      ).toBeVisible( ) );
      const { checkMultiple } = jest.requireMock( "react-native-permissions" );
      checkMultiple.mockImplementation( async permissions => permissions.reduce(
        ( acc, permission ) => ( { ...acc, [permission]: RESULTS.GRANTED } ),
        {},
      ) );
      const changeHandlers = AppState.addEventListener.mock.calls
        .slice( listenersBefore )
        .filter( ( [event] ) => event === "change" )
        .map( ( [, handler] ) => handler );
      await world.advance( 0 );
      await act( async ( ) => {
        await Promise.all( changeHandlers.map( handler => handler( "background" ) ) );
      } );
      await act( async ( ) => {
        await Promise.all( changeHandlers.map( handler => handler( "active" ) ) );
      } );
      await waitFor( ( ) => expect( world.gps.watching ).toBe( 1 ) );
      await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
      await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    } finally {
      AppState.currentState = originalState;
    }
  } );

  it( "R-NET-15 the API answers with an empty response", async ( ) => {
    const { computervision } = jest.requireMock( "inaturalistjs" );
    computervision.score_image.mockImplementation( async ( ) => undefined );
    world.setObservation( observationWithLocation( ) );
    const { impl } = renderMatch( );
    await world.advance( 4_500 );
    // Same as an error: 3 tries, then the on-device model
    expect( world.onlineCalls( ) ).toHaveLength( 3 );
    expect( world.offlineCalls( ) ).toHaveLength( 1 );
    await world.respondOffline( [prediction( TAXA.compassPlant, 90 )] );
    await waitFor( ( ) => expect( impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
    expect( impl.read( ALL_TAXA ).top ).toMatchObject( { id: TAXA.compassPlant.id } );
    // The same unawaited logging as R-NET-05
    expect( unawaitedApiErrors ).toHaveLength( 3 );
  } );
} );
