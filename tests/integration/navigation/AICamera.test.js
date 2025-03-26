import Geolocation from "@react-native-community/geolocation";
import {
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions.ts";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { BackHandler } from "react-native";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice.ts";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url"
  }
};

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
  useStore.setState( {
    layout: {
      isDefaultMode: false,
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
      isAllAddObsOptionsMode: true
    }
  } );
  inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
} );

afterEach( ( ) => {
  signOut( { realm: global.mockRealms[__filename] } );
} );

const actor = userEvent.setup( );

const navToAICamera = async ( ) => {
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const cameraButton = await screen.findByLabelText( /AI Camera/ );
  await actor.press( cameraButton );
};

const takePhotoAndNavToSuggestions = async ( ) => {
  const takePhotoButton = await screen.findByLabelText( /Take photo/ );
  await actor.press( takePhotoButton );
  const addIDButton = await screen.findByText( /ADD AN ID/ );
  expect( addIDButton ).toBeVisible( );
};

const navToObsEditWithTopSuggestion = async ( ) => {
  const topTaxonResultButton = await screen.findByTestId(
    `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
  );
  await actor.press( topTaxonResultButton );
  const evidenceList = await screen.findByTestId( "EvidenceList.DraggableFlatList" );
  expect( evidenceList ).toBeVisible( );
  // one photo from AICamera
  expect( evidenceList.props.data.length ).toEqual( 1 );
};

describe( "AICamera navigation with advanced user layout", ( ) => {
  describe( "from MyObs", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      await navToAICamera( );
      expect( await screen.findByText( /Loading iNaturalist's AI Camera/ ) ).toBeVisible( );
      const closeButton = await screen.findByLabelText( /Close/ );
      await actor.press( closeButton );
      expect( await screen.findByText( /Use iNaturalist to identify any living thing/ ) ).toBeVisible( );
    } );
  } );

  describe( "to Suggestions", ( ) => {
    beforeEach( ( ) => {
      useStore.setState( {
        layout: {
          isDefaultMode: false,
          screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
          isAllAddObsOptionsMode: true
        }
      } );

      const mockWatchPosition = jest.fn( ( success, _error, _options ) => success( {
        coords: {
          latitude: 56,
          longitude: 9,
          accuracy: 8
        }
      } ) );
      Geolocation.watchPosition.mockImplementation( mockWatchPosition );
      jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
        handleTaxaDetected: jest.fn( ),
        modelLoaded: true,
        result: {
          taxon: mockLocalTaxon
        },
        setResult: jest.fn( )
      } ) );
    } );

    it( "should advance to suggestions screen", async ( ) => {
      renderApp( );
      await navToAICamera( );
      expect( await screen.findByText( mockLocalTaxon.name ) ).toBeTruthy( );
      await takePhotoAndNavToSuggestions( );
    } );

    it( "should advance from suggestions to obs edit, back out to AI camera, and"
      + " advance to obs edit with a single observation photo", async ( ) => {
      renderApp( );
      await navToAICamera( );
      expect( await screen.findByText( mockLocalTaxon.name ) ).toBeTruthy( );
      await takePhotoAndNavToSuggestions( );
      await navToObsEditWithTopSuggestion( );
      const obsEditBackButton = screen.getByTestId( "ObsEdit.BackButton" );
      await actor.press( obsEditBackButton );
      BackHandler.mockPressBack( );
      await takePhotoAndNavToSuggestions( );
      await navToObsEditWithTopSuggestion( );
    } );
  } );
} );
