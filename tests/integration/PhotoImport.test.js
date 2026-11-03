import ImageResizer from "@bam.tech/react-native-image-resizer";
import {
  screen,
  userEvent,
} from "@testing-library/react-native";
import * as paths from "appConstants/paths";
import initI18next from "i18n/initI18next";
import { Platform } from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import factory from "tests/factory";
import {
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

const mockUser = factory( "LocalUser" );
// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => mockUser ),
} ) );

jest.mock( "sharedHooks/useObservationCounts", () => {
  const { UNSYNCED_FILTER } = jest.requireActual( "realmModels/Observation" );
  return {
    __esModule: true,
    default: () => {
      const realm = global.mockRealms[__filename];
      if ( !realm ) return { numUnuploadedObservations: 0, numObsMissingBasics: 0 };
      const unsynced = realm.objects( "Observation" ).filtered( UNSYNCED_FILTER );
      return {
        numUnuploadedObservations: unsynced.length,
        numObsMissingBasics: unsynced
          .filter( obs => obs.missingBasics( ) ).length,
      };
    },
  };
} );

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

  async function saveObservationWithPhoto( saveOptions = {} ) {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    expect( evidenceTitle ).toBeVisible( );

    const [photoEvidence] = await screen.findAllByLabelText( "Select or drag media" );
    expect( photoEvidence ).toBeVisible();
    await saveObsEditObservation( saveOptions );
    if ( !saveOptions.skipMyObsWait ) {
      const obsGridItems = await waitForMyObsGridItems();
      expect( obsGridItems[0] ).toBeVisible();
      // Wait until header shows that there's an obs to upload
      await screen.findByText( /Upload \d observation/ );
    }
  }

  it( "should create and save an observation with an imported photo", async ( ) => {
    renderApp( );
    await navigateToPhotoImporterFromMyObs();
    await saveObservationWithPhoto();
  } );

  it( "should create and save an observation with multiple imported photos", async ( ) => {
    jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => mockImageLibraryResponseMultiplePhotos,
    );
    renderApp( );
    await navigateToPhotoImporterFromMyObs();
    await groupPhotosIntoObservation();
    await screen.findByTestId( "ObsEdit.saveButton", {}, { timeout: 10_000 } );
    await saveObservationWithPhoto( { skipMyObsWait: true } );
  } );

  describe( "on Android", ( ) => {
    const defaultPlatformOS = Platform.OS;
    // The mocked DocumentDirectoryPath is relative; on a device it's absolute
    const androidGalleryPath
      = "/data/user/0/org.inaturalist.iNaturalistMobile/files/galleryPhotos";
    const pickerUri = `content://media/picker/0/com.android.providers.media.photopicker/media/${
      mockFileName
    }`;

    beforeEach( ( ) => {
      Platform.OS = "android";
      // Platform.select is hardwired to iOS under Jest
      jest.spyOn( Platform, "select" ).mockImplementation(
        spec => ( "android" in spec
          ? spec.android
          : spec.default ),
      );
      jest.replaceProperty( paths, "photoLibraryPhotosPath", androidGalleryPath );
      jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation( ( ) => ( {
        assets: [{ uri: pickerUri, fileName: mockFileName }],
      } ) );
      ImageResizer.createResizedImage.mockClear( );
    } );

    afterEach( ( ) => {
      Platform.OS = defaultPlatformOS;
      jest.restoreAllMocks( );
    } );

    it( "should resize the gallery copy of a picked photo via a file:// URI", async ( ) => {
      renderApp( );
      await navigateToPhotoImporterFromMyObs();
      await saveObservationWithPhoto();
      const resizedUris = ImageResizer.createResizedImage.mock.calls.map( ( [uri] ) => uri );
      expect( resizedUris ).toContain( `file://${androidGalleryPath}/${mockFileName}` );
    } );
  } );
} );
