import {
  act,
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import os from "os";
import path from "path";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";
import Realm from "realm";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";
import Observation from "realmModels/Observation";

import factory, { makeResponse } from "../factory";
import { renderComponent } from "../helpers/render";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// This is a bit crazy, but this ensures this test uses its own in-memory
// database and doesn't interfere with the single, default in-memory database
// used by other tests. In a perfect world, every parallel test worker would
// have its own database, or at least this wouldn't be so manual, but it took
// me long enough to figure this out. ~~~kueda 20231024 REALM SETUP
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

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

// For all of these tests we need an existing observation to show suggestions for
const mockObservations = [
  factory( "LocalObservation", {
    _synced_at: null,
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ]
  } )
];

// Render the ObsEditProvider with the mocked observation
function renderObservationsStackNavigator( ) {
  renderComponent(
    <ObsEditProvider
      value={{
        observations: mockObservations,
        currentObservation: mockObservations[0]
      }}
    >
      <ObservationsStackNavigator />
    </ObsEditProvider>
  );
}

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsEdit to Suggestions for all of these
  // tests
  async function navigateToSuggestions( ) {
    const unknownObsInMyObs = await screen.findByText( "unknown" );
    await actor.press( unknownObsInMyObs );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  beforeAll( async () => {
    await initI18next();
    // Save the mock observation in Realm
    await Observation.saveLocalObservationForUpload(
      mockObservations[0],
      global.mockRealms[__filename]
    );
    // userEvent recommends fake timers
    jest.useFakeTimers( );
  } );

  describe( "when reached from ObsEdit", ( ) => {
    // Mock the response from inatjs.computervision.score_image
    const topSuggestion = {
      taxon: factory( "RemoteTaxon" ),
      combined_score: 90
    };
    const otherSuggestion = {
      taxon: factory( "RemoteTaxon" ),
      combined_score: 50
    };
    const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
    inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
    inatjs.observations.observers.mockResolvedValue( makeResponse( ) );

    it( "should navigate back to ObsEdit when top suggestion chosen", async ( ) => {
      renderObservationsStackNavigator( );
      await navigateToSuggestions( );
      const topTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
      );
      expect( topTaxonResultButton ).toBeTruthy( );
      await actor.press( topTaxonResultButton );
      expect( await screen.findByText( "EVIDENCE" ) ).toBeTruthy( );
    } );

    it( "should navigate back to ObsEdit when another suggestion chosen", async ( ) => {
      renderObservationsStackNavigator( );
      await navigateToSuggestions( );
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
      "should navigate back to ObsEdit when reached from ObsEdit via Suggestions"
      + " and search result chosen",
      async ( ) => {
        renderObservationsStackNavigator( );
        await navigateToSuggestions( );
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
      }
    );
  } );
} );
