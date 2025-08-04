import {
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { Animated } from "react-native";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice.ts";
import factory, { makeResponse } from "tests/factory";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// Not my favorite code, but this patch is necessary to get tests passing right
// now unless we can figure out why Animated.Value is being passed undefined,
// which seems specifically related to the AICamera (this is also happening in the
// Suggestions and SuggestionsWithUnsyncedObs tests which use the AICamera)
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

const mockModelResult = {
  predictions: [factory( "ModelPrediction", {
  // useOfflineSuggestions will filter out taxa w/ rank_level > 40
    rank_level: 20
  } )]
};
inatjs.computervision.score_image.mockResolvedValue( makeResponse( [] ) );
getPredictionsForImage.mockImplementation(
  async ( ) => ( mockModelResult )
);

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

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
} );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90
};

const mockUser = factory( "LocalUser" );

beforeEach( async ( ) => {
  await signIn( mockUser, { realm: global.mockRealms[__filename] } );
  setStoreStateLayout( {
    isDefaultMode: false,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
    isAllAddObsOptionsMode: true
  } );
  inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
} );

afterEach( ( ) => {
  signOut( { realm: global.mockRealms[__filename] } );
} );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 56, longitude: 9, accuracy: 8 } ) );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

const actor = userEvent.setup( );

const navToAICamera = async ( ) => {
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const cameraButton = await screen.findByLabelText( /AI Camera/ );
  await actor.press( cameraButton );
};

describe( "AICamera navigation with advanced user layout", ( ) => {
  describe( "from MyObs", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      await navToAICamera( );
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( await screen.findByText( /Loading iNaturalist's AI Camera/ ) ).toBeOnTheScreen( );
      const closeButton = await screen.findByLabelText( /Close/ );
      await actor.press( closeButton );
      expect(
        await screen.findByText( /Use iNaturalist to identify any living thing/ )
      ).toBeTruthy( );
    } );
  } );
} );
