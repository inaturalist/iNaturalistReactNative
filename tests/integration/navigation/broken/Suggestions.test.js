import {
  act,
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions.ts";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { Animated } from "react-native";
import * as useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice.ts";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderAppWithObservations } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

// Not my favorite code, but this patch is necessary to get tests passing right
// now unless we can figure out why Animated.Value is being passed undefined,
// which seems related to the AICamera
const OriginalValue = Animated.Value;

beforeEach( () => {
  // Patch the Value constructor to be safer with undefined values
  Animated.Value = function ( val ) {
    return new OriginalValue( val === undefined
      ? 0
      : val );
  };
} );

afterEach( () => {
  // Restore original implementation
  Animated.Value = OriginalValue;
} );

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 56, longitude: 9, accuracy: 8 } ) );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

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

const makeUnsyncedObservations = options => ( [
  factory( "LocalObservation", {
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    geoprivacy: "obscured",
    ...options
  } )
] );

const mockUser = factory( "LocalUser", {
  login: faker.internet.userName( ),
  iconUrl: faker.image.url( ),
  locale: "en"
} );

const topSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Primum suggestion" } ),
  combined_score: 90
};
const otherSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
  combined_score: 50
};

beforeAll( async () => {
  await initI18next();
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

beforeEach( async () => {
  setStoreStateLayout( {
    isDefaultMode: false
  } );
} );

describe( "Suggestions", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsEdit to Suggestions for all of these
  // tests
  async function navigateToSuggestionsViaObsEditForObservation( observation, options ) {
    const observationGridItem = await screen.findByTestId(
      `MyObservations.obsGridItem.${observation.uuid}`
    );
    await actor.press( observationGridItem );
    if ( options?.toTaxonSearch ) {
      const taxonSearchButton = await screen.findByText( "SEARCH" );
      await actor.press( taxonSearchButton );
    } else {
      const addIdButton = observation.taxon
        ? await screen.findByLabelText( "Edit identification" )
        : await screen.findByText( "ID WITH AI" );
      await actor.press( addIdButton );
    }
  }

  async function navigateToSuggestionsViaCameraForObservation( ) {
    const tabBar = await screen.findByTestId( "CustomTabBar" );
    const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
    await actor.press( addObsButton );
    const cameraButton = await screen.findByLabelText( /AI Camera/ );
    await actor.press( cameraButton );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
    const addIDButton = await screen.findByText( /ADD AN ID/ );
    await waitFor( ( ) => {
      global.timeTravel( );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( addIDButton ).toBeOnTheScreen( );
    } );
  }

  describe( "when reached from ObsEdit", ( ) => {
    // Mock the response from inatjs.computervision.score_image
    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
    } );

    afterEach( ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
      inatjs.computervision.score_image.mockClear( );
      inatjs.observations.observers.mockClear( );
      inatjs.taxa.fetch.mockClear( );
    } );

    it(
      "should navigate back to ObsEdit with expected observation when top suggestion chosen",
      async ( ) => {
        const observations = makeUnsyncedObservations( );
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsViaObsEditForObservation( observations[0] );
        const topTaxonResultButton = await screen.findByTestId(
          `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
        );
        expect( topTaxonResultButton ).toBeTruthy( );
        await actor.press( topTaxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        // We used toBeVisible here but the update to RN0.77 broke this expectation
        expect( await screen.findByText( /Obscured/ ) ).toBeOnTheScreen( );
      }
    );

    it( "should navigate back to ObsEdit when another suggestion chosen", async ( ) => {
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      const otherTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${otherSuggestion.taxon.id}.checkmark`
      );
      expect( otherTaxonResultButton ).toBeTruthy( );
      await actor.press( otherTaxonResultButton );
      expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
    } );
  } );

  describe( "when reached from AI Camera directly", ( ) => {
    beforeEach( async ( ) => {
      await signIn( mockUser, { realm: global.mockRealms[__filename] } );
      setStoreStateLayout( {
        isDefaultMode: false,
        screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
        isAllAddObsOptionsMode: true
      } );
      inatjs.computervision.score_image
        .mockResolvedValue( makeResponse( [topSuggestion] ) );
      jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
        handleTaxaDetected: jest.fn( ),
        modelLoaded: true,
        result: {
          taxon: []
        },
        setResult: jest.fn( )
      } ) );
    } );

    afterEach( ( ) => {
      signOut( { realm: global.mockRealms[__filename] } );
      inatjs.computervision.score_image.mockClear( );
    } );

    it( "should not show location permissions button if permissions granted", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: true,
        renderPermissionsGate: jest.fn( )
      } ) );
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaCameraForObservation( observations[0] );
      const locationPermissionsButton = screen.queryByText( /IMPROVE THESE SUGGESTIONS/ );
      expect( locationPermissionsButton ).toBeFalsy( );
    } );

    it( "should show location permissions button if permissions not granted", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: jest.fn( )
      } ) );
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaCameraForObservation( observations[0] );
      const locationPermissionsButton = screen.queryByText( /IMPROVE THESE SUGGESTIONS/ );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( locationPermissionsButton ).toBeOnTheScreen( );
    } );
  } );

  describe( "TaxonSearch", ( ) => {
    it(
      "should navigate back to ObsEdit with expected observation"
      + " when reached from ObsEdit via Suggestions and search result chosen",
      async ( ) => {
        const observations = makeUnsyncedObservations();
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsViaObsEditForObservation( observations[0], {
          toTaxonSearch: true
        } );
        const searchInput = await screen.findByLabelText( "Search for a taxon" );
        const mockSearchResultTaxon = factory( "RemoteTaxon" );
        inatjs.search.mockResolvedValue( makeResponse( [
          { taxon: mockSearchResultTaxon }
        ] ) );
        await act(
          async ( ) => actor.type(
            searchInput,
            "doesn't really matter since we're mocking the response"
          )
        );
        const taxonResultButton = await screen.findByTestId(
          `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
        );
        expect( taxonResultButton ).toBeTruthy( );
        await actor.press( taxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        // We used toBeVisible here but the update to RN0.77 broke this expectation
        expect( await screen.findByText( /Obscured/ ) ).toBeOnTheScreen( );
      }
    );
  } );
} );
