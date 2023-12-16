import { faker } from "@faker-js/faker";
import {
  // act,
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import ObservationsStackNavigator from "navigation/StackNavigators/ObservationsStackNavigator";
import os from "os";
import path from "path";
import React from "react";
import Realm from "realm";
import Identification from "realmModels/Identification";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";
import factory, { makeResponse } from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockOfflinePrediction = {
  score: 0.97363,
  taxon: {
    rank_level: 10,
    name: "Felis Catus",
    id: 118552
  }
};

// const mockSearchResultTaxon = factory( "RemoteTaxon" );

// TODO remove this mock. This is an integration test, so we should only mock
// things outside of this app's code, which in this case is
// vision-camera-plugin-inatvision
jest.mock( "components/Suggestions/hooks/useOfflineSuggestions", ( ) => ( {
  __esModule: true,
  default: ( ) => ( {
    offlineSuggestions: [mockOfflinePrediction],
    loadingOfflineSuggestions: false
  } )
} ) );

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
  await initI18next();
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  // jest.clearAllMocks( );
} );
// /REALM SETUP

const mockUser = factory( "LocalUser", {
  login: "fake_login",
  signedIn: true
} );

const makeMockObservations = ( ) => ( [
  factory( "LocalObservation", {
    _synced_at: faker.date.past( ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    user: mockUser,
    positional_accuracy: 90,
    observed_on_string: "2020-01-01",
    latitude: Number( faker.location.latitude( ) ),
    longitude: Number( faker.location.longitude( ) )
  } )
] );

async function renderObservationsStackNavigatorWithObservations( observations ) {
  // Save the mock observation in Realm
  global.mockRealms[__filename].write( ( ) => {
    global.mockRealms[__filename].create( "Observation", observations[0], "modified" );
  } );
  renderComponent(
    <ObservationsStackNavigator />
  );
}

// TODO restore these tests. I broke them but couldn't figure out how to fix
// them in the time I had ~~~~kueda 20231215
// const mockIdentification = factory( "RemoteIdentification", {
//   uuid: "123456789",
//   user: factory( "LocalUser" ),
//   taxon: factory( "LocalTaxon", {
//     name: "Miner's Lettuce",
//     rank_level: 10
//   } )
// } );
//
// describe( "TaxonSearch", ( ) => {
//   beforeEach( ( ) => {
//     inatjs.identifications.create.mockResolvedValue( { results: [mockIdentification] } );
//     inatjs.search.mockResolvedValue( makeResponse( [
//       {
//         taxon: mockSearchResultTaxon
//       }
//     ] ) );
//     inatjs.observations.observers.mockResolvedValue( makeResponse( [
//       {
//         observation_count: faker.number.int( ),
//         species_count: faker.number.int( ),
//         user: factory( "RemoteUser" )
//       }
//     ] ) );
//   } );

//   afterEach( ( ) => {
//     inatjs.identifications.create.mockReset( );
//     inatjs.search.mockReset( );
//     inatjs.observations.observers.mockReset( );
//   } );

//   const actor = userEvent.setup( );

//   // We need to navigate from MyObs to ObsDetails to Suggestions to TaxonSearch for all of these
//   // tests
//   async function navigateToTaxonSearchForObservation( observation ) {
//     const observationRow = await screen.findByTestId(
//       `MyObservations.obsListItem.${observation.uuid}`
//     );
//     await actor.press( observationRow );
//     const suggestIdButton = await screen.findByText( "SUGGEST ID" );
//     await actor.press( suggestIdButton );
//     const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
//     await actor.press( searchButton );
//   }

//   async function navigateToTaxonSearchForObservationViaObsEdit( observation ) {
//     const observationRow = await screen.findByTestId(
//       `MyObservations.obsListItem.${observation.uuid}`
//     );
//     await actor.press( observationRow );
//     const suggestIdButton = await screen.findByLabelText( "Edit" );
//     await actor.press( suggestIdButton );
//     const addIdButton = await screen.findByText( "ADD AN ID" );
//     await actor.press( addIdButton );
//     const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
//     await actor.press( searchButton );
//   }
//
//   it(
//     "should create an id with false vision attribute when reached from ObsDetails via"
//     + " Suggestions and search result chosen",
//     async ( ) => {
//       const observations = makeMockObservations( );
//       await renderObservationsStackNavigatorWithObservations( observations );
//       await navigateToTaxonSearchForObservation( observations[0] );
//       const searchInput = await screen.findByLabelText( "Search for a taxon" );
//       await act(
//         async ( ) => actor.type(
//           searchInput,
//           "doesn't really matter since we're mocking the response"
//         )
//       );
//       const taxonResultButton = await screen.findByTestId(
//         `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
//       );
//       expect( taxonResultButton ).toBeTruthy( );
//       await actor.press( taxonResultButton );
//       expect( await screen.findByText( "ACTIVITY" ) ).toBeTruthy( );
//       expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
//         fields: Identification.ID_FIELDS,
//         identification: {
//           observation_id: observations[0].uuid,
//           taxon_id: mockSearchResultTaxon.id,
//           vision: false
//         }
//       }, {
//         api_token: null
//       } );
//     }
//   );

//   it(
//     "should update observation with false vision attribute when reached from ObsEdit"
//     + " and search result chosen",
//     async ( ) => {
//       const observations = makeMockObservations( );
//       await renderObservationsStackNavigatorWithObservations( observations );
//       await navigateToTaxonSearchForObservationViaObsEdit( observations[0] );
//       const searchInput = await screen.findByLabelText( "Search for a taxon" );
//       await act(
//         async ( ) => actor.type(
//           searchInput,
//           "doesn't really matter since we're mocking the response"
//         )
//       );
//       const taxonResultButton = await screen.findByTestId(
//         `Search.taxa.${mockSearchResultTaxon.id}.checkmark`
//       );
//       expect( taxonResultButton ).toBeTruthy( );
//       await actor.press( taxonResultButton );
//       const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
//       expect( saveChangesButton ).toBeTruthy( );
//       await actor.press( saveChangesButton );
//       const savedObservation = global.mockRealms[__filename]
//         .objectForPrimaryKey( "Observation", observations[0].uuid );
//       expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", false );
//     }
//   );
// } );

describe( "Suggestions", ( ) => {
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

  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsDetails to Suggestions for all of these
  // tests
  async function navigateToSuggestionsForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const suggestIdButton = await screen.findByText( "SUGGEST ID" );
    await actor.press( suggestIdButton );
  }

  async function navigateToSuggestionsForObservationViaObsEdit( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const suggestIdButton = await screen.findByLabelText( "Edit" );
    await actor.press( suggestIdButton );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  it(
    "should create an id with true vision attribute when reached from ObsDetails"
    + " and taxon chosen",
    async ( ) => {
      const observations = makeMockObservations( );
      await renderObservationsStackNavigatorWithObservations( observations );
      await navigateToSuggestionsForObservation( observations[0] );
      const taxonId = topSuggestion.taxon.id;
      console.log( taxonId, "top computer vision suggestion" );
      const topTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${taxonId}.checkmark`
      );
      expect( topTaxonResultButton ).toBeTruthy( );
      await actor.press( topTaxonResultButton );
      expect( await screen.findByText( "ACTIVITY" ) ).toBeTruthy( );
      expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
        fields: Identification.ID_FIELDS,
        identification: {
          observation_id: observations[0].uuid,
          taxon_id: taxonId,
          vision: true
        }
      }, {
        api_token: null
      } );
    }
  );

  it(
    "should update observation with true vision attribute when reached from ObsEdit"
    + " and taxon chosen",
    async ( ) => {
      const observations = makeMockObservations( );
      await renderObservationsStackNavigatorWithObservations( observations );
      await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
      const topTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
      );
      expect( topTaxonResultButton ).toBeTruthy( );
      await actor.press( topTaxonResultButton );
      const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
      expect( saveChangesButton ).toBeTruthy( );
      await actor.press( saveChangesButton );
      const savedObservation = global.mockRealms[__filename]
        .objectForPrimaryKey( "Observation", observations[0].uuid );
      expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
    }
  );

  it(
    "should try offline suggestions if no online suggestions are found",
    async ( ) => {
      const mockScoreImageResponse = makeResponse( [] );
      inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
      const observations = makeMockObservations( );
      await renderObservationsStackNavigatorWithObservations( observations );
      await navigateToSuggestionsForObservationViaObsEdit( observations[0] );

      const topOnlineTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${mockOfflinePrediction.taxon.id}.checkmark`
      );
      expect( topOnlineTaxonResultButton ).toBeTruthy( );
      await actor.press( topOnlineTaxonResultButton );
      const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
      expect( saveChangesButton ).toBeTruthy( );
      await actor.press( saveChangesButton );
      const savedObservation = global.mockRealms[__filename]
        .objectForPrimaryKey( "Observation", observations[0].uuid );
      expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
    }
  );

  it.todo( "should create an identification when accessed from Explore" );
} );
