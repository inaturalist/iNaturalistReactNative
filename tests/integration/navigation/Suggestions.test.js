import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import os from "os";
import path from "path";
import Realm from "realm";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// This is a bit crazy, but this ensures this test uses its own in-memory
// database and doesn't interfere with the single, default in-memory database
// used by other tests. In a perfect world, every parallel test worker would
// have its own database, or at least this wouldn't be so manual, but it took
// me long enough to figure this out. ~~~kueda 20231024
// REALM SETUP
const mockRealmConfig = {
  schema: realmConfig.schema,
  schemaVersion: realmConfig.schemaVersion,
  // No need to actually write to disk
  inMemory: true,
  // For an in memory db path is basically a unique identifier, *but* Realm
  // may still write some metadata to disk, so this needs to be a real, but
  // temporary, path. In theory this should prevent this test from
  // interacting with other tests
  path: path.join( os.tmpdir( ), `${path.basename( __filename )}.realm` )
};

// Mock the config so that all code that runs during this test talks to the same database
jest.mock( "realmModels/index", ( ) => ( {
  __esModule: true,
  default: mockRealmConfig
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[__filename]
    }
  };
} );

const initialStoreState = useStore.getState( );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
  useStore.setState( initialStoreState, true );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
} );
// /REALM SETUP

// // import { useNetInfo } from "@react-native-community/netinfo";
// jest.mock( "@react-native-community/netinfo", ( ) => ( {
//   useNetInfo: jest.fn( ( ) => ( {
//     isInternetReachable: true
//   } ) )
// } ) );

const makeMockObservations = ( ) => ( [
  factory( "LocalObservation", {
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    geoprivacy: "obscured"
  } )
] );

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsEdit to Suggestions for all of these
  // tests
  async function navigateToSuggestionsForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  beforeAll( async () => {
    await initI18next();
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  describe( "when reached from ObsEdit", ( ) => {
    // Mock the response from inatjs.computervision.score_image
    const topSuggestion = {
      taxon: factory( "RemoteTaxon", { name: "Primum suggestion" } ),
      combined_score: 90
    };
    const otherSuggestion = {
      taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
      combined_score: 50
    };
    beforeEach( ( ) => {
      const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
      inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
    } );

    afterEach( ( ) => {
      inatjs.computervision.score_image.mockReset( );
      inatjs.observations.observers.mockReset( );
      inatjs.taxa.fetch.mockReset( );
    } );

    it(
      "should navigate back to ObsEdit with expected observation when top suggestion chosen",
      async ( ) => {
        const observations = makeMockObservations( );
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsForObservation( observations[0] );
        const topTaxonResultButton = await screen.findByTestId(
          `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
        );
        expect( topTaxonResultButton ).toBeTruthy( );
        await actor.press( topTaxonResultButton );
        expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );

    it( "should navigate back to ObsEdit when another suggestion chosen", async ( ) => {
      const observations = makeMockObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToSuggestionsForObservation( observations[0] );
      const otherTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${otherSuggestion.taxon.id}.checkmark`
      );
      expect( otherTaxonResultButton ).toBeTruthy( );
      await actor.press( otherTaxonResultButton );
      expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
    } );
  } );

  describe( "TaxonSearch", ( ) => {
    it(
      "should navigate back to ObsEdit with expected observation"
      + " when reached from ObsEdit via Suggestions and search result chosen",
      async ( ) => {
        const observations = [
          factory( "LocalObservation", { geoprivacy: "obscured" } )
        ];
        useStore.setState( { observations } );
        await renderAppWithObservations( observations, __filename );
        await navigateToSuggestionsForObservation( observations[0] );
        const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
        await actor.press( searchButton );
        const searchInput = await screen.findByLabelText( "Search for a taxon" );
        const mockSearchResultTaxon = factory( "RemoteTaxon" );
        inatjs.search.mockResolvedValue( makeResponse( [
          {
            taxon: mockSearchResultTaxon
          }
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
        expect( await screen.findByText( /Obscured/ ) ).toBeVisible( );
      }
    );
  } );
} );
