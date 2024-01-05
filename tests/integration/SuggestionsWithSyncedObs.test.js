import { faker } from "@faker-js/faker";
import {
  act,
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import os from "os";
import path from "path";
import Realm from "realm";
import Identification from "realmModels/Identification";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import { signIn, signOut, TEST_JWT } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

const mockModelPrediction = factory( "ModelPrediction", {
  // useOfflineSuggestions will filter out taxa w/ rank_level > 40
  rank: 20
} );

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

const initialStoreState = useStore.getState( );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
  useStore.setState( initialStoreState, true );
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

const mockUser = factory( "LocalUser" );

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: faker.date.past( ),
    needsSync: jest.fn( ( ) => false ),
    wasSynced: jest.fn( ( ) => true ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" )
    ],
    user: mockUser,
    observed_on_string: "2020-01-01"
  } )
] );

async function setupAppWithSignedInUser( ) {
  const observations = makeMockObservations( );
  useStore.setState( { observations } );
  await renderAppWithObservations( observations, __filename );
  return { observations };
}

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90
};
const otherSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Alia suggestione" } ),
  combined_score: 50
};

beforeEach( async ( ) => {
  const mockScoreImageResponse = makeResponse( [topSuggestion, otherSuggestion] );
  inatjs.computervision.score_image.mockResolvedValue( mockScoreImageResponse );
  inatjs.observations.observers.mockResolvedValue( makeResponse( ) );
  inatjs.taxa.fetch.mockResolvedValue( makeResponse( [topSuggestion.taxon] ) );
  inatjs.observations.viewedUpdates.mockResolvedValue( makeResponse( ) );
  inatjs.identifications.create.mockResolvedValue( {
    results: [factory( "RemoteIdentification", {
      taxon: topSuggestion.taxon,
      user: mockUser
    } )]
  } );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( ( ) => {
  inatjs.computervision.score_image.mockReset( );
  inatjs.observations.observers.mockReset( );
  inatjs.taxa.fetch.mockReset( );
  inatjs.observations.viewedUpdates.mockReset( );
  inatjs.identifications.create.mockReset( );
  signOut( { realm: global.mockRealms[__filename] } );
} );

describe( "TaxonSearch", ( ) => {
  const mockSearchResultTaxon = factory( "RemoteTaxon" );

  beforeEach( ( ) => {
    inatjs.search.mockResolvedValue( makeResponse( [
      {
        taxon: mockSearchResultTaxon
      }
    ] ) );
    inatjs.observations.observers.mockResolvedValue( makeResponse( [
      {
        observation_count: faker.number.int( ),
        species_count: faker.number.int( ),
        user: factory( "RemoteUser" )
      }
    ] ) );
    inatjs.taxa.fetch.mockResolvedValue( makeResponse( [] ) );
  } );

  afterEach( ( ) => {
    inatjs.search.mockReset( );
    inatjs.observations.observers.mockReset( );
    inatjs.taxa.fetch.mockReset( );
  } );

  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsDetails to Suggestions to TaxonSearch for all of these
  // tests
  async function navigateToTaxonSearchForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const suggestIdButton = await screen.findByText( "SUGGEST ID" );
    await act( async ( ) => actor.press( suggestIdButton ) );
    await screen.findByTestId(
      `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
    );
    const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
    await actor.press( searchButton );
  }

  async function navigateToTaxonSearchForObservationViaObsEdit( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const editButton = await screen.findByLabelText( "Edit" );
    await act( async ( ) => actor.press( editButton ) );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
    await screen.findByTestId(
      `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
    );
    const searchButton = await screen.findByText( "SEARCH FOR A TAXON" );
    await actor.press( searchButton );
  }

  it(
    "should create an id with false vision attribute when reached from ObsDetails via"
    + " Suggestions and search result chosen",
    async ( ) => {
      const { observations } = await setupAppWithSignedInUser( );
      await navigateToTaxonSearchForObservation( observations[0] );
      const searchInput = await screen.findByLabelText( "Search for a taxon" );
      expect( searchInput ).toBeVisible( );
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
      expect( await screen.findByText( "ACTIVITY" ) ).toBeTruthy( );
      expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
        fields: Identification.ID_FIELDS,
        identification: {
          observation_id: observations[0].uuid,
          taxon_id: mockSearchResultTaxon.id,
          vision: false
        }
      }, {
        api_token: TEST_JWT
      } );
    }
  );

  it(
    "should update observation with false vision attribute when reached from ObsEdit"
    + " and search result chosen",
    async ( ) => {
      const { observations } = await setupAppWithSignedInUser( );
      await navigateToTaxonSearchForObservationViaObsEdit( observations[0] );
      const searchInput = await screen.findByLabelText( "Search for a taxon" );
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
      const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
      expect( saveChangesButton ).toBeTruthy( );
      await actor.press( saveChangesButton );
      const savedObservation = global.mockRealms[__filename]
        .objectForPrimaryKey( "Observation", observations[0].uuid );
      expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", false );
    }
  );
} );

describe( "Suggestions", ( ) => {
  const actor = userEvent.setup( );

  // We need to navigate from MyObs to ObsDetails to Suggestions for all of these
  // tests
  async function navigateToSuggestionsForObservation( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const suggestIdButton = await screen.findByText( "SUGGEST ID" );
    await act( async ( ) => actor.press( suggestIdButton ) );
  }

  async function navigateToSuggestionsForObservationViaObsEdit( observation ) {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const editButton = await screen.findByLabelText( "Edit" );
    await act( async ( ) => actor.press( editButton ) );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  }

  it( "should create ident with vision=true via ObsDetails", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservation( observations[0] );
    const taxonId = topSuggestion.taxon.id;
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${taxonId}.checkmark`
    );
    expect( topTaxonResultButton ).toBeTruthy( );
    await actor.press( topTaxonResultButton );
    const activityTab = await screen.findByTestId( "ActivityTab" );
    expect( activityTab ).toBeVisible( );
    // Wait for the actual identification we created to appear
    const taxonNameInIdent = await within( activityTab ).findByText( topSuggestion.taxon.name );
    expect( taxonNameInIdent ).toBeVisible( );
    expect( inatjs.identifications.create ).toHaveBeenCalledWith( {
      fields: Identification.ID_FIELDS,
      identification: {
        observation_id: observations[0].uuid,
        taxon_id: taxonId,
        vision: true
      }
    }, {
      api_token: TEST_JWT
    } );
  } );

  it( "should update observation with vision=true via ObsEdit", async ( ) => {
    const { observations } = await setupAppWithSignedInUser( );
    await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
    );
    expect( topTaxonResultButton ).toBeTruthy( );
    await actor.press( topTaxonResultButton );
    const saveChangesButton = await screen.findByText( "SAVE CHANGES" );
    expect( saveChangesButton ).toBeTruthy( );
    await actor.press( saveChangesButton );
    // Ensure we're back on MyObs
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observations[0].uuid}`
    );
    expect( observationRow ).toBeVisible( );
    const savedObservation = global.mockRealms[__filename]
      .objectForPrimaryKey( "Observation", observations[0].uuid );
    expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
  } );

  it(
    "should try offline suggestions if no online suggestions are found",
    async ( ) => {
      inatjs.computervision.score_image.mockResolvedValue( makeResponse( [] ) );
      getPredictionsForImage.mockImplementation(
        async ( ) => ( [mockModelPrediction] )
      );
      const { observations } = await setupAppWithSignedInUser( );
      await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
      const offlineNotice = await screen.findByText( "Viewing Offline Suggestions" );
      expect( offlineNotice ).toBeVisible( );
      const topOfflineTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${mockModelPrediction.taxon_id}.checkmark`
      );
      expect( topOfflineTaxonResultButton ).toBeTruthy( );
      await act( async ( ) => actor.press( topOfflineTaxonResultButton ) );
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
