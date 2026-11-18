// Following a person from Match to the screens next to it and back, with
// those screens rendered for real instead of stubbed. Scenarios tagged [bug]
// enforce today's (buggy) behavior on purpose: fixing the bug should be a
// deliberate change to the expectation.
import {
  screen, userEvent, waitFor,
} from "@testing-library/react-native";
import * as apiError from "api/error";
import ObsEdit from "components/ObsEdit/ObsEdit";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import Geocoder from "react-native-geocoder-reborn";
import useStore from "stores/useStore";
import { makeResponse } from "tests/factory";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

import { renderMatch } from "./matchHarness";
import {
  ICONIC_TAXA,
  makeNewObservation,
  makeWorld,
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
  // What the species page loads
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [TAXA.cupPlant] ) );
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

// What the camera leaves on a new observation once it knows where the person
// is: good coordinates and the place name
const observationWithLocation = ( ) => makeNewObservation( {
  latitude: 41.5,
  longitude: -93.6,
  positional_accuracy: 5,
  place_guess: "Ames, IA, US",
} );

// Arrive on Match from the camera, with `screens` rendered for real
const showMatchWith = async ( observation, results, screens ) => {
  world.setObservation( observation );
  const view = renderMatch( { from: "Camera", screens } );
  await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
  await world.respondOnline( results );
  await waitFor( ( ) => expect( view.impl.read( ALL_TAXA ).analyzing ).toBe( false ) );
  return view;
};

const DISCARD_CHANGES_WARNING = "By exiting, changes to your observation will not be saved.";

describe( "Match → Edit → species page", ( ) => {
  // SUSPECTED BUG: TaxonDetails decides it was opened from Match by looking
  // for "Match" anywhere in the stack (fromMatch, TaxonDetails.tsx:129), not
  // at the screen right below it. ObsEdit opened from Match keeps Match in the
  // stack, so a species page opened from ObsEdit's Identify list also gets
  // Match's Save and Discard buttons (TaxonDetails.tsx:450) next to SELECT
  // THIS TAXON. Discard there leaves the flow without saving
  // (useExitObservationFlow) and without the warning ObsEdit would give, so
  // the new observation is gone.
  it( "J-01 [bug] Edit, Identify, species info: Discard throws away the new observation "
    + "with no warning", async ( ) => {
    const observation = observationWithLocation( );
    const { impl, currentRoute, stack } = await showMatchWith(
      observation,
      CONFIDENT_RESULTS,
      { ObsEdit, Suggestions: SuggestionsContainer, TaxonDetails },
    );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    await actor.press( await screen.findByTestId( "ObsEdit.IDWithAI" ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Suggestions" ) );
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 2 ) );
    await world.respondOnline( CONFIDENT_RESULTS, { call: 1 } );
    await screen.findByTestId( `SuggestionsList.taxa.${TAXA.cupPlant.id}` );
    // The top suggestion's info button
    await actor.press( screen.getAllByLabelText( "More info" )[0] );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TaxonDetails" ) );
    expect( currentRoute( ).params ).toMatchObject( { id: TAXA.cupPlant.id } );
    expect( stack( ) ).toEqual( ["Camera", "Match", "ObsEdit", "Suggestions", "TaxonDetails"] );

    // The page offers the way out this journey expects...
    expect( await screen.findByTestId( "TaxonDetails.SelectButton" ) ).toBeVisible( );
    // ...and Match's, which only make sense when Match is the screen below
    expect( screen.getByTestId( "MatchScreen.saveButton" ) ).toBeVisible( );
    expect( screen.getByTestId( "MatchScreen.discardButton" ) ).toBeVisible( );

    await actor.press( screen.getByTestId( "MatchScreen.discardButton" ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toBeNull( );
  } );
} );

describe( "Match → Edit → back to Match", ( ) => {
  let geocodeSpy;
  afterEach( ( ) => geocodeSpy?.mockRestore( ) );

  // SUSPECTED BUG: going back from an ObsEdit opened on Match restores Match's
  // snapshot, and warns first whenever `unsavedChanges` is set
  // (ObsEditHeader.js:104-106). ObsEdit's own location watch writes the GPS
  // fix with updateObservationKeys (ObsEdit.js:76-80), which always sets
  // `unsavedChanges`. So if GPS hasn't settled before the person taps the
  // pencil, backing out warns about changes they never made, and the only way
  // back to Match throws the location away. Match then starts GPS again.
  it( "J-02 [bug] Edit before GPS settles, then back: warns about changes the person "
    + "didn't make and drops the location", async ( ) => {
    const observation = makeNewObservation( );
    const { impl, currentRoute } = await showMatchWith(
      observation,
      CONFIDENT_RESULTS,
      { ObsEdit },
    );
    expect( world.gps.watching ).toBe( 1 );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    // ObsEdit starts its own GPS watch and gets the fix Match was waiting for
    await waitFor( ( ) => expect( world.gps.watching ).toBe( 2 ) );
    await world.deliverGpsFix( { latitude: 10, longitude: 20 } );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation ).toMatchObject( {
      latitude: 10, longitude: 20,
    } );

    // The person changed nothing and goes back
    await actor.press( screen.getByTestId( "ObsEdit.BackButton" ) );
    await world.advance( 500 );
    expect( currentRoute( ).name ).toBe( "ObsEdit" );
    expect( screen.getByText( DISCARD_CHANGES_WARNING ) ).toBeVisible( );
    await actor.press( screen.getAllByText( "DISCARD CHANGES" ).at( -1 ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );
    expect( useStore.getState( ).currentObservation.latitude ).toBeUndefined( );
    expect( impl.read( ALL_TAXA ) ).toMatchObject( { map: false, addLocationButton: true } );
    // and Match has to look for the location all over again
    expect( world.gps.watching ).toBe( 3 );
  } );

  // SUSPECTED BUG: same cause as J-02, different trigger. ObsEdit fills in a
  // missing place name on arrival (EvidenceSectionContainer.js:136-166), and
  // that write also sets `unsavedChanges`. A Match observation can easily have
  // coordinates but no place name (the camera's lookup timed out, or Match's
  // own lookup lags, see R-LOC-12), so just opening ObsEdit and backing out
  // warns about changes, and discarding drops the place name.
  it( "J-03 [bug] Edit on an observation without a place name, then back: warns about "
    + "changes the person didn't make", async ( ) => {
    geocodeSpy = jest.spyOn( Geocoder, "geocodePosition" ).mockImplementation(
      ( ) => Promise.resolve( [{ locality: "Ames", adminArea: "IA", countryCode: "US" }] ),
    );
    const observation = makeNewObservation( {
      latitude: 41.5, longitude: -93.6, positional_accuracy: 5,
    } );
    const { impl, currentRoute } = await showMatchWith(
      observation,
      CONFIDENT_RESULTS,
      { ObsEdit },
    );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    await world.advance( 1_000 );
    expect( useStore.getState( ).currentObservation.place_guess ).toBe( "Ames, IA, US" );

    await actor.press( screen.getByTestId( "ObsEdit.BackButton" ) );
    await world.advance( 500 );
    expect( currentRoute( ).name ).toBe( "ObsEdit" );
    expect( screen.getByText( DISCARD_CHANGES_WARNING ) ).toBeVisible( );
    await actor.press( screen.getAllByText( "DISCARD CHANGES" ).at( -1 ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );

    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ).place_guess ).toBeNull( );
  } );
} );

describe( "Match → My Observations", ( ) => {
  afterEach( ( ) => {
    useStore.setState( { myObsOffset: 0, myObsOffsetToRestore: 0 } );
  } );

  // SUSPECTED BUG: My Observations scrolls to `myObsOffsetToRestore` when its
  // list lays out (MyObservationsResults.tsx:328-333, 643). The other ways of
  // saving a new observation clear it so the new one shows at the top
  // (BottomButtonsContainer.tsx:82-85, TaxonDetails.tsx:245-247), but Match's
  // Save doesn't (MatchContainer.tsx:456-465). Worse, Match's pencil sets it
  // to wherever My Observations was last scrolled (useNavigateToObsEdit.ts:46).
  // So after a trip to ObsEdit and back, saving on Match lands the person
  // part way down their list with the new observation out of sight.
  it( "J-04 [bug] Edit and back, then Save: My Observations is told to reopen scrolled "
    + "down, away from the new observation", async ( ) => {
    // How far down My Observations the person was before opening the camera
    useStore.setState( { myObsOffset: 2400, myObsOffsetToRestore: 0 } );
    const observation = observationWithLocation( );
    const { impl, currentRoute } = await showMatchWith(
      observation,
      CONFIDENT_RESULTS,
      { ObsEdit },
    );
    await impl.pressEdit( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsEdit" ) );
    // Nothing changed, so this goes straight back to Match
    await actor.press( screen.getByTestId( "ObsEdit.BackButton" ) );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "Match" ) );

    await impl.pressSave( actor );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
    expect( savedObservation( observation.uuid ) ).toBeTruthy( );
    expect( useStore.getState( ).myObsOffsetToRestore ).toBe( 2400 );
  } );
} );
