import {
  act,
  screen,
  userEvent,
  waitFor
} from "@testing-library/react-native";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

const mockModelResult = {
  predictions: [factory( "ModelPrediction", {
  // useOfflineSuggestions will filter out taxa w/ rank_level > 40
    rank_level: 20
  } )]
};

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

const initialStoreState = useStore.getState( );
beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90
};

const humanSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Homo sapiens", id: 43584 } ),
  combined_score: 86
};

const mockUser = factory( "LocalUser" );

const makeMockObservations = ( ) => ( [
  factory( "RemoteObservation", {
    _synced_at: null,
    needsSync: jest.fn( ( ) => true ),
    wasSynced: jest.fn( ( ) => false ),
    // Suggestions won't load without a photo
    observationPhotos: [
      factory( "RemoteObservationPhoto" )
    ],
    user: mockUser,
    observed_on_string: "2020-01-01"
  } )
] );

beforeEach( async ( ) => {
  inatjs.computervision.score_image
    .mockResolvedValue( makeResponse( [] ) );
  getPredictionsForImage.mockImplementation(
    async ( ) => ( mockModelResult )
  );
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
} );

afterEach( ( ) => {
  inatjs.computervision.score_image.mockReset( );
  signOut( { realm: global.mockRealms[__filename] } );
} );

describe( "SuggestionsWithUnsyncedObs", ( ) => {
  const actor = userEvent.setup( );

  const navigateToSuggestionsForObservationViaObsEdit = async observation => {
    const observationRow = await screen.findByTestId(
      `MyObservations.obsListItem.${observation.uuid}`
    );
    await actor.press( observationRow );
    const addIdButton = await screen.findByText( "ADD AN ID" );
    await actor.press( addIdButton );
  };

  const setupAppWithSignedInUser = async ( ) => {
    const observations = makeMockObservations( );
    useStore.setState( { observations } );
    await renderAppWithObservations( observations, __filename );
    return { observations };
  };

  it(
    "should try offline suggestions if no online suggestions are found",
    async ( ) => {
      const { observations } = await setupAppWithSignedInUser( );
      await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
      const offlineNotice = await screen.findByText( /You are offline. Tap to reload/ );
      await waitFor( ( ) => {
        expect( offlineNotice ).toBeTruthy( );
      }, { timeout: 10000 } );
      const topOfflineTaxonResultButton = await screen.findByTestId(
        `SuggestionsList.taxa.${mockModelResult.predictions[0].taxon_id}.checkmark`
      );
      expect( topOfflineTaxonResultButton ).toBeTruthy( );
      await act( async ( ) => actor.press( topOfflineTaxonResultButton ) );
      const saveButton = await screen.findByText( /SAVE/ );
      expect( saveButton ).toBeTruthy( );
      await actor.press( saveButton );
      const savedObservation = global.mockRealms[__filename]
        .objectForPrimaryKey( "Observation", observations[0].uuid );
      await waitFor( ( ) => {
        expect( savedObservation ).toHaveProperty( "owners_identification_from_vision", true );
      }, { timeout: 10000 } );
    }
  );

  describe( "human observation", ( ) => {
    beforeEach( async ( ) => {
      inatjs.computervision.score_image
        .mockResolvedValue( makeResponse( [humanSuggestion, topSuggestion] ) );
    } );

    afterEach( ( ) => {
      inatjs.computervision.score_image.mockReset( );
    } );

    it(
      "should display only a single human observation if human is found in suggestions",
      async ( ) => {
        const { observations } = await setupAppWithSignedInUser( );
        await navigateToSuggestionsForObservationViaObsEdit( observations[0] );
        const humanResultButton = await screen.findByTestId(
          `SuggestionsList.taxa.${humanSuggestion.taxon.id}.checkmark`
        );
        expect( humanResultButton ).toBeVisible( );
        const human = screen.getByText( /Homo sapiens/ );
        expect( human ).toBeVisible( );
        const nonHumanSuggestion = screen.queryByText( /Primum/ );
        expect( nonHumanSuggestion ).toBeFalsy( );
      }
    );
  } );
} );
