
import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import factory, { makeResponse } from "tests/factory";
import {
  navigateToPhotoImporterFromMyObs,
  saveObsEditObservation,
  waitForMyObsGridItems,
} from "tests/helpers/addObsBottomSheet";
import { renderApp } from "tests/helpers/render";
import setStoreStateLayout from "tests/helpers/setStoreStateLayout";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 1, longitude: 1, accuracy: 9 } ) );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation(),
} ) );

const mockModelResult = {
  predictions: [factory( "ModelPrediction", {
  // useOfflineSuggestions will filter out taxa w/ rank_level > 40
    rank_level: 20,
  } )],
};
getPredictionsForImage.mockImplementation(
  async ( ) => ( mockModelResult ),
);

const mockUser = factory( "LocalUser" );
// Mock useCurrentUser hook
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
  mockInteractionManagerRunAfterInteractions();
} );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90,
};

beforeEach( ( ) => {
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true,
    screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
  } );
  inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
} );

describe( "Photo Deletion with existing saved observation", () => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  const actor = userEvent.setup( );

  async function createSavedObservationWithImportedPhoto() {
    jest.spyOn( rnImagePicker, "launchImageLibrary" ).mockImplementation( () => ( {
      assets: [{
        uri: faker.image.url(),
        fileName: `${faker.string.uuid()}.jpg`,
      }],
    } ) );
    await navigateToPhotoImporterFromMyObs();
    await screen.findByText( /New Observation/ );
    await saveObsEditObservation();
    const obsGridItems = await waitForMyObsGridItems();
    await actor.press( obsGridItems[0] );
    await screen.findByText( "EVIDENCE" );
  }

  async function deletePhotoInMediaViewer() {
    const deleteButton = await screen.findByLabelText( "Delete photo" );
    await actor.press( deleteButton );
    const warningSheet = await screen.findByTestId( "MediaViewer.DiscardMediaWarningSheet" );
    const discardButton = await within( warningSheet ).findByText( "DISCARD" );
    await actor.press( discardButton );
  }


  async function expectNoPhotosInStandardCamera() {
    const noPhotoText = await screen.findByText( "Photos you take will appear here" );
    expect( noPhotoText ).toBeVisible();
  }

  async function viewPhotoFromObsEdit() {
    const evidenceItem = await screen.findByLabelText( "Select or drag media" );
    expect( evidenceItem ).toBeVisible();
    await actor.press( evidenceItem );
  }

  async function expectObsEditToHaveNoPhotos() {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    // Confirm there is no evidence
    expect( evidenceTitle ).toBeVisible();
    const evidenceItems = screen.queryAllByLabelText( "Select or drag media" );
    expect( evidenceItems.length ).toEqual( 0 );
  }

  it( "should delete from StandardCamera for existing photo", async ( ) => {
    renderApp( );
    await createSavedObservationWithImportedPhoto();
    // Enter camera to add new photo
    const addEvidenceButton = await screen.findByLabelText( "Add evidence" );
    await actor.press( addEvidenceButton );
    const addEvidenceSheet = await screen.findByTestId( "AddEvidenceSheet" );
    const cameraButton = await within( addEvidenceSheet ).findByLabelText( "Camera" );
    await actor.press( cameraButton );
    await waitFor( () => {
      global.timeTravel( 300 );
      expect( screen.getByTestId( "CameraNavButtons" ) ).toBeVisible();
    } );
    await actor.press( await screen.findByTestId( "take-photo-button" ) );
    // Tap one photo preview to enter the MediaViewer
    const carouselPhotos = await screen.findAllByTestId( /PhotoCarousel\.displayPhoto/ );
    await actor.press( carouselPhotos[0] );
    await deletePhotoInMediaViewer();
    await expectNoPhotosInStandardCamera();
  } );

  it( "should delete from ObsEdit for existing camera photo", async ( ) => {
    renderApp( );
    await createSavedObservationWithImportedPhoto();
    await viewPhotoFromObsEdit();
    await deletePhotoInMediaViewer( );
    await expectObsEditToHaveNoPhotos();
  } );

  // TODO these will require mocking react-native-image-picker
  it.todo( "should delete from ObsEdit for existing gallery photo" );
} );
