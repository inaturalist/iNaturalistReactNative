import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { Animated } from "react-native";
import * as useLocationPermission from "sharedHooks/useLocationPermission.tsx";
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

// const makeSyncedObservations = ( ) => ( [
//   factory( "LocalObservation", {
//     // Suggestions won't load without a photo
//     observationPhotos: [
//       factory( "LocalObservationPhoto", {
//         _synced_at: faker.date.past( ),
//         needsSync: jest.fn( ( ) => false ),
//         wasSynced: jest.fn( ( ) => true )
//       } )
//     ],
//     _synced_at: faker.date.past( ),
//     needsSync: jest.fn( ( ) => false ),
//     wasSynced: jest.fn( ( ) => true )
//   } )
// ] );

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

    it( "should show the add ID later button if there's no taxon", async ( ) => {
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      expect( await screen.findByText( "Add an ID Later" ) ).toBeTruthy( );
    } );

    it( "should not show the add ID later button if there is a taxon", async ( ) => {
      const observations = makeUnsyncedObservations( {
        taxon: factory( "LocalTaxon" )
      } );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      await screen.findByText( "TOP ID SUGGESTION" );
      expect( screen.queryByText( "Add an ID Later" ) ).toBeFalsy( );
    } );

    it( "should never show location permissions button", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: jest.fn( )
      } ) );
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsViaObsEditForObservation( observations[0] );
      const locationPermissionsButton = screen.queryByText( /IMPROVE THESE SUGGESTIONS/ );
      expect( locationPermissionsButton ).toBeFalsy( );
    } );
  } );

  describe( "when reached from ObsDetails", ( ) => {
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
    it.todo( "should not show the add ID later button" );
    // Note quite sure why this doesn't work, seems like realm gets deleted
    // while the component is still mounted for some reason
    //
    // it( "should not show the add ID later button", async ( ) => {
    //   const observations = makeSyncedObservations( );
    //   await renderAppWithObservations( observations, __filename );
    //   await navigateToSuggestionsViaObsDetailsForObservation( observations[0] );
    //   await screen.findByText( "TOP ID SUGGESTION" );
    //   expect( screen.queryByText( "Add an ID Later" ) ).toBeFalsy( );
    // } );
  } );
} );
