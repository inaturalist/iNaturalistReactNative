import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import * as rnImagePicker from "react-native-image-picker";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import useStore from "stores/useStore";
import factory from "tests/factory";
import {
  advancePhotoLibraryTimers,
  mockInteractionManagerRunAfterInteractions,
  navigateToPhotoImporterFromMyObs,
  saveObsEditObservation,
  waitForMyObsGridItems,
} from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const mockUser = factory( "LocalUser" );
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => mockUser ),
} ) );

// UNIQUE REALM SETUP
const mockRealmIdentifier = __filename;
const { mockRealmModelsIndex, uniqueRealmBeforeAll, uniqueRealmAfterAll } = setupUniqueRealm(
  mockRealmIdentifier,
);
jest.mock( "realmModels/index", ( ) => mockRealmModelsIndex );
jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  const { makeRealmHooks } = jest.requireActual( "tests/helpers/uniqueRealm" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      ...makeRealmHooks( __filename ),
    },
  };
} );
beforeAll( uniqueRealmBeforeAll );
afterAll( uniqueRealmAfterAll );
// /UNIQUE REALM SETUP

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
  mockInteractionManagerRunAfterInteractions( );
} );

const mockAsset = [{
  uri: faker.image.url( ),
  fileName: `${faker.string.uuid( )}.jpg`,
}];

const mockMultipleAssets = [{
  uri: faker.image.url( ),
  fileName: `${faker.string.uuid( )}.jpg`,
}, {
  uri: faker.image.url( ),
  fileName: `${faker.string.uuid( )}.jpg`,
}];

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( ),
} ) );

describe( "PhotoLibrary navigation", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

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
    await navigateToPhotoImporterFromMyObs( );
    await waitFor( ( ) => {
      expect( screen.getByText( /Group Photos/ ) ).toBeVisible( );
    }, { timeout: 10_000 } );
  } );

  it( "advances to ObsEdit when one photo is selected", async ( ) => {
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => ( {
        assets: mockAsset,
      } ),
    );
    renderApp( );
    await navigateToPhotoImporterFromMyObs( );
    await waitFor( () => {
      expect( screen.getByText( /New Observation/ ) ).toBeVisible( );
    }, { timeout: 10_000 } );
  } );
} );

describe( "PhotoLibrary navigation when suggestions screen is preferred next screen", () => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

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
    await navigateToPhotoImporterFromMyObs( );
    await waitFor( () => {
      expect( screen.getByText( /Add an ID Later/ ) ).toBeVisible( );
    }, { timeout: 10_000 } );
  } );
} );

describe( "PhotoLibrary adding evidence to an existing observation", () => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  const actor = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

  beforeEach( () => {
    setStoreStateLayout( {
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
      isDefaultMode: false,
      isAllAddObsOptionsMode: true,
    } );
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation( () => ( {
      assets: mockAsset,
    } ) );
  } );

  it( "marks the observation as having unsaved changes", async () => {
    renderApp();
    await navigateToPhotoImporterFromMyObs( );
    await screen.findByText( /New Observation/ );
    await saveObsEditObservation( );
    const obsGridItems = await waitForMyObsGridItems( );
    await actor.press( obsGridItems[0] );
    await screen.findByText( "EVIDENCE" );
    expect( useStore.getState( ).unsavedChanges ).toBe( false );

    await actor.press( await screen.findByLabelText( "Add evidence" ) );
    const addEvidenceSheet = await screen.findByTestId( "AddEvidenceSheet" );
    await actor.press( await within( addEvidenceSheet ).findByLabelText( "Bulk importer" ) );
    await advancePhotoLibraryTimers( );

    await waitFor( () => {
      expect( useStore.getState( ).unsavedChanges ).toBe( true );
    }, { timeout: 10_000 } );
  } );
} );
