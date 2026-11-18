// State from one observation that outlives it and shows up in the next
// observation or on another screen during the same app session. Each scenario
// enforces today's (buggy) behavior on purpose: fixing the bug should be a
// deliberate change to the expectation.
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  createNavigationContainerRef,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import * as apiError from "api/error";
import SuggestionsContainer from "components/Suggestions/SuggestionsContainer";
import TaxonDetails from "components/TaxonDetails/TaxonDetails";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import INatPaperProvider from "providers/INatPaperProvider";
import React from "react";
import { Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "react-native-image-picker";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import {
  mockInteractionManagerRunAfterInteractions,
  navigateToPhotoImporterFromMyObs,
} from "tests/helpers/addObsBottomSheet";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

import { renderMatch } from "./MatchRequirements/matchHarness";
import {
  ICONIC_TAXA,
  makeNewObservation,
  makeObservationPhoto,
  makeWorld,
  suggestion,
  TAXA,
} from "./MatchRequirements/matchWorld";

jest.unmock( "@react-navigation/native" );

// NetInfo whose answer can change mid-test (matchWorld drives it)
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

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( ),
} ) );

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
const realm = ( ) => global.mockRealms[mockRealmIdentifier];
const actor = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

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
  jest.spyOn( apiError, "default" ).mockImplementation( ( e, options ) => {
    const result = actualHandleError( e, options );
    if ( options?.throw === false ) {
      return result.catch( ( ) => undefined );
    }
    return result;
  } );
} );

const CONFIDENT_RESULTS = [
  suggestion( TAXA.cupPlant, 95 ),
  suggestion( TAXA.compassPlant, 30 ),
];

// The default-mode path: AI camera shutter, then Match, then Save
const observeWithAICameraAndSaveOnMatch = async observation => {
  // What AICamera's shutter does before the photo is processed
  useStore.getState( ).setAICameraSuggestion( suggestion( TAXA.cupPlant, 95 ) );
  world.setObservation( observation );
  const { impl, currentRoute } = renderMatch( );
  await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
  await world.respondOnline( CONFIDENT_RESULTS );
  await waitFor( ( ) => expect( screen.getByTestId( "MatchScreen.saveButton" ) ).toBeVisible( ) );
  await impl.pressSave( actor );
  await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "TabNavigator" ) );
  screen.unmount( );
};

const Stack = createNativeStackNavigator( );
const Placeholder = ( { route } ) => <Text>{route.name}</Text>;

// Renders `routes` as one stack, the last one on top
const renderStack = ( routes, components ) => {
  const navigationRef = createNavigationContainerRef( );
  const queryClient = new QueryClient( {
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  } );
  render(
    <QueryClientProvider client={queryClient}>
      <INatPaperProvider>
        <GestureHandlerRootView className="flex-1">
          <BottomSheetModalProvider>
            <NavigationContainer
              ref={navigationRef}
              initialState={{ index: routes.length - 1, routes }}
              theme={{
                ...DefaultTheme,
                fonts: { regular: { fontFamily: "System", fontWeight: "normal" } },
              }}
            >
              <Stack.Navigator>
                {routes.map( ( { name } ) => (
                  <Stack.Screen
                    key={name}
                    name={name}
                    component={components[name] || Placeholder}
                  />
                ) )}
              </Stack.Navigator>
            </NavigationContainer>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </INatPaperProvider>
    </QueryClientProvider>,
  );
  return { currentRoute: ( ) => navigationRef.getCurrentRoute( ) };
};

describe( "Observation flow state that outlives the observation", ( ) => {
  // SUSPECTED BUG: Match leaves the flow with skipStoreReset, so the saved
  // observation stays in the store as currentObservation. TaxonDetails falls
  // back to that "editing" observation whenever it wasn't opened from
  // ObsDetails, so browsing any species in Explore centers its map on, and
  // pins, the place where the person made their last observation.
  it( "S-01 after saving on Match, a species page opened from Explore pins the saved "
    + "observation's location on its map", async ( ) => {
    const observation = makeNewObservation( {
      latitude: 41.5, longitude: -93.6, positional_accuracy: 5,
    } );
    await observeWithAICameraAndSaveOnMatch( observation );
    expect( realm( ).objectForPrimaryKey( "Observation", observation.uuid ) ).toBeTruthy( );

    // Later, browsing an unrelated species in Explore
    inatjs.taxa.fetch.mockResolvedValue( makeResponse( [TAXA.human] ) );
    inatjs.observations.search.mockResolvedValue( {
      ...makeResponse( [] ),
      total_results: 1000,
      total_bounds: {
        swlat: -40, swlng: -120, nelat: 60, nelng: 140,
      },
    } );
    renderStack( [
      { name: "RootExplore" },
      { name: "TaxonDetails", params: { id: TAXA.human.id } },
    ], { TaxonDetails } );

    const pin = await screen.findByTestId( "Map.LocationIndicator" );
    expect( pin.parent.parent.props.coordinate ).toEqual( { latitude: 41.5, longitude: -93.6 } );
    // and the map is centered on that spot instead of the species' range
    expect( screen.getByTestId( "Map.MapView" ).props.initialRegion ).toMatchObject( {
      latitude: 41.5, longitude: -93.6,
    } );
  } );

  // SUSPECTED BUG: the AI camera's guess (aICameraSuggestion) is only cleared
  // by resetObservationFlowSlice, which Match skips on the way out, and
  // ObsDetails' Suggest ID only calls setObservations. So while Suggestions
  // loads for a different observation, the last AI camera species is offered
  // as a suggestion, and tapping it adds that species as an ID.
  it( "S-02 after saving on Match, Suggest ID on another observation offers the earlier "
    + "AI camera species while loading", async ( ) => {
    await observeWithAICameraAndSaveOnMatch( makeNewObservation( {
      latitude: 41.5, longitude: -93.6, positional_accuracy: 5,
    } ) );
    world.reset( );

    // Someone else's observation of a person, opened from Explore
    const othersObservation = factory( "LocalObservation", {
      _synced_at: new Date( ),
      latitude: 10,
      longitude: 20,
      observationPhotos: [
        makeObservationPhoto( "photoUploads/someone-elses-photo.jpg" ),
      ],
    } );
    // What ObsDetails' "Suggest ID" button does before navigating
    useStore.getState( ).setObservations( [othersObservation] );
    const { currentRoute } = renderStack( [
      { name: "ObsDetails", params: { uuid: othersObservation.uuid } },
      {
        name: "Suggestions",
        params: { entryScreen: "ObsDetails", lastScreen: "ObsDetails", hideSkip: true },
      },
    ], { Suggestions: SuggestionsContainer } );

    // The online request for the new photo is still in flight
    await waitFor( ( ) => expect( world.onlineCalls( ) ).toHaveLength( 1 ) );
    expect( screen.getByText( "iNaturalist is loading ID suggestions..." ) ).toBeVisible( );
    const staleSuggestion = screen.getByTestId( `SuggestionsList.taxa.${TAXA.cupPlant.id}` );
    expect( staleSuggestion ).toBeVisible( );

    await actor.press( staleSuggestion );
    await waitFor( ( ) => expect( currentRoute( ).name ).toBe( "ObsDetails" ) );
    expect( currentRoute( ).params ).toMatchObject( {
      uuid: othersObservation.uuid,
      identTaxonId: TAXA.cupPlant.id,
      identTaxonFromVision: true,
    } );
  } );
} );

describe( "Regrouping imported photos after viewing them in ObsEdit", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  const galleryUri = fileName => `file://document/directory/path/galleryPhotos/${fileName}`;

  beforeEach( ( ) => {
    mockInteractionManagerRunAfterInteractions( );
    setStoreStateLayout( {
      isDefaultMode: false,
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
      isAllAddObsOptionsMode: true,
    } );
    jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation( ( ) => ( {
      assets: [
        { uri: "picker://flower", fileName: "flower.jpg" },
        { uri: "picker://leaf", fileName: "leaf.jpg" },
      ],
    } ) );
  } );

  // SUSPECTED BUG: currentObservationIndex survives going back from ObsEdit
  // to GroupPhotos, and setObservations picks the new current observation by
  // that old index. After combining, the batch is shorter than the index, so
  // ObsEdit opens with no current observation: no photos, no fields, no Save.
  it( "S-03 viewing the 2nd of 2 imported observations, going back and combining them "
    + "opens an empty ObsEdit", async ( ) => {
    renderApp( );
    await navigateToPhotoImporterFromMyObs( );
    await actor.press( await screen.findByText( "IMPORT 2 OBSERVATIONS" ) );
    await screen.findByTestId( "ObsEdit.saveButton", {}, { timeout: 10_000 } );
    await actor.press( screen.getByLabelText( "Next observation" ) );
    await waitFor( ( ) => expect( useStore.getState( ).currentObservationIndex ).toBe( 1 ) );

    // Back to Group Photos to combine them into one observation
    await actor.press( screen.getByTestId( "ObsEdit.BackButton" ) );
    await actor.press( await screen.findByTestId( `GroupPhotos.${galleryUri( "flower.jpg" )}` ) );
    await actor.press( screen.getByTestId( `GroupPhotos.${galleryUri( "leaf.jpg" )}` ) );
    await actor.press( screen.getByLabelText( "Combine Photos" ) );
    await actor.press( await screen.findByText( "IMPORT 1 OBSERVATION" ) );

    await screen.findByText( "New Observation" );
    expect( useStore.getState( ).observations ).toHaveLength( 1 );
    expect( useStore.getState( ).currentObservationIndex ).toBe( 1 );
    expect( useStore.getState( ).currentObservation ).toBeUndefined( );
    expect( screen.queryByText( "EVIDENCE" ) ).toBeNull( );
    expect( screen.queryByTestId( "ObsEdit.saveButton" ) ).toBeNull( );
  } );

  // SUSPECTED BUG: photoLibraryUris holds every photo imported in the batch,
  // for all observations, and the standard camera counts it toward the
  // 20-photos-per-observation limit (on top of the current observation's own
  // photos, which prepareCamera puts in cameraUris).
  it( "S-04 after importing 19 photos as 19 observations, the camera won't add a "
    + "photo to one that has a single photo", async ( ) => {
    const fileNames = Array.from( { length: 19 }, ( _, i ) => `photo-${i}.jpg` );
    jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation( ( ) => ( {
      assets: fileNames.map( fileName => ( { uri: `picker://${fileName}`, fileName } ) ),
    } ) );
    renderApp( );
    await navigateToPhotoImporterFromMyObs( );
    await actor.press( await screen.findByText( "IMPORT 19 OBSERVATIONS" ) );
    await screen.findByTestId( "ObsEdit.saveButton", {}, { timeout: 10_000 } );
    expect( useStore.getState( ).currentObservation.observationPhotos ).toHaveLength( 1 );

    await actor.press( screen.getByTestId( "EvidenceList.add" ) );
    await actor.press( await screen.findByLabelText( "Camera" ) );
    const shutter = await screen.findByTestId( "take-photo-button" );
    await waitFor( ( ) => expect( shutter ).toBeDisabled( ) );
    expect( useStore.getState( ).cameraUris ).toHaveLength( 1 );
    expect( useStore.getState( ).photoLibraryUris ).toHaveLength( 19 );
  } );
} );
