import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import * as rnImagePicker from "react-native-image-picker";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
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
      useQuery: ( ) => [],
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

beforeAll( async () => {
  await initI18next();
} );

const mockAsset = [{
  uri: faker.image.url( ),
}];

const mockMultipleAssets = [{
  uri: faker.image.url( ),
}, {
  uri: faker.image.url( ),
}];

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( ),
} ) );

const actor = userEvent.setup( );

const navigateToPhotoImporter = async ( ) => {
  await waitFor( ( ) => {
    // We used toBeVisible here but the update to RN0.77 broke this expectation
    expect( screen.getByText( /Use iNaturalist to identify/ ) ).toBeOnTheScreen( );
  } );
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const photoImporter = await screen.findByLabelText( "Photo importer" );
  await actor.press( photoImporter );
};

describe( "PhotoLibrary navigation", ( ) => {
  beforeEach( ( ) => {
    setStoreStateLayout( {
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
      isDefaultMode: false,
      isAllAddObsOptionsMode: true,
    } );
  } );

  it( "advances to GroupPhotos when multiple photos are selected", async ( ) => {
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => ( {
        assets: mockMultipleAssets,
      } ),
    );
    renderApp( );
    await navigateToPhotoImporter( );
    const groupPhotosText = await screen.findByText( /Group Photos/ );
    await waitFor( ( ) => {
      // user should land on GroupPhotos
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( groupPhotosText ).toBeOnTheScreen( );
    } );
  } );

  it( "advances to ObsEdit when one photo is selected", async ( ) => {
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => ( {
        assets: mockAsset,
      } ),
    );
    renderApp( );
    await navigateToPhotoImporter( );
    const obsEditText = await screen.findByText( /New Observation/ );
    await waitFor( () => {
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( obsEditText ).toBeOnTheScreen();
    } );
  } );
} );

describe( "PhotoLibrary navigation when suggestions screen is preferred next screen", () => {
  beforeEach( () => {
    setStoreStateLayout( {
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
      isDefaultMode: false,
      isAllAddObsOptionsMode: true,
    } );
  } );
  it( "advances to Suggestions when one photo is selected", async () => {
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation( () => ( {
      assets: mockAsset,
    } ) );
    renderApp();
    await navigateToPhotoImporter();
    const addAnIDText = await screen.findByText( /Add an ID Later/ );
    await waitFor( () => {
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( addAnIDText ).toBeOnTheScreen();
    } );
  } );
} );
