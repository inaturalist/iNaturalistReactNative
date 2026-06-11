import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import * as ImagePicker from "react-native-image-picker";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import factory from "tests/factory";
import {
  navigateToPhotoImporterFromMyObs,
} from "tests/helpers/addObsBottomSheet";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const directory = faker.string.uuid( );
const mockFileName = `${faker.string.uuid( )}.jpg`;
const mockUri = `file:///var/mobile/Containers/Data/Application/${directory}/tmp/${mockFileName}`;

const mockImageLibraryResponse = {
  assets: [
    {
      uri: mockUri,
      fileName: mockFileName,
    },
  ],
};

const mockImageLibraryResponseMultiplePhotos = {
  assets: [
    {
      uri: "some_uri",
      fileName: "some_file_name",
    },
    {
      uri: mockUri,
      fileName: mockFileName,
    },
  ],
};

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( ( ) => mockImageLibraryResponse ),
} ) );

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

const mockUser = factory( "LocalUser" );
// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => mockUser ),
} ) );


beforeAll( async () => {
  await initI18next();
  mockInteractionManagerRunAfterInteractions( );
} );

describe( "Photo Import", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  const actor = userEvent.setup( );

  beforeEach( async () => {
    setStoreStateLayout( {
      isDefaultMode: false,
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
      isAllAddObsOptionsMode: true,
    } );
  } );
  async function groupPhotosIntoObservation() {
    const groupPhotosText = await screen.findByText( /Group Photos/ );
    expect( groupPhotosText ).toBeVisible();
    const path = "file://document/directory/path/galleryPhotos/";
    const firstUri = `${path}${mockImageLibraryResponseMultiplePhotos.assets[0].fileName}`;
    const secondUri = `${path}${mockImageLibraryResponseMultiplePhotos.assets[1].fileName}`;
    const firstPhoto = await screen.findByTestId( `GroupPhotos.${firstUri}` );
    await actor.press( firstPhoto );
    const secondPhoto = await screen.findByTestId( `GroupPhotos.${secondUri}` );
    await actor.press( secondPhoto );
    const combineButton = await screen.findByLabelText( /Combine Photos/ );
    await actor.press( combineButton );
    const importButton = await screen.findByText( /IMPORT 1 OBSERVATION/ );
    await actor.press( importButton );
  }

  async function saveObservationWithPhoto() {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    const saveButton = await screen.findByText( "SAVE" );
    await actor.press( saveButton );
    const okButton = await screen.findByText( "OK" );
    await actor.press( okButton );
    await actor.press( saveButton );
    // Wait until header shows that there's an obs to upload
    await screen.findByText( /Upload \d observation/ );
    const obsGridItems = await screen.findAllByTestId( /MyObservations\.obsGridItem\..*/ );
    expect( evidenceTitle ).toBeVisible( );

    const [photoEvidence] = await screen.findAllByLabelText( "Select or drag media" );
    expect( photoEvidence ).toBeVisible();
    await waitFor( () => {
      // We used toBeVisible here but the update to RN0.77 broke this expectation
      expect( obsGridItems[0] ).toBeOnTheScreen( );
    }, { timeout: 3_000, interval: 500 } );
  }

  it( "should create and save an observation with an imported photo", async ( ) => {
    renderApp( );
    await saveObservationWithPhoto( );
    await navigateToPhotoImporterFromMyObs();
  } );

  it( "should create and save an observation with multiple imported photos", async ( ) => {
    jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => mockImageLibraryResponseMultiplePhotos,
    );
    renderApp( );
    await saveObservationWithPhoto( );
    await navigateToPhotoImporterFromMyObs();
    await groupPhotosIntoObservation();
  } );
} );
