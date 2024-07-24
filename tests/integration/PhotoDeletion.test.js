import Geolocation from "@react-native-community/geolocation";
import {
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import * as useOfflineSuggestions from "components/Suggestions/hooks/useOfflineSuggestions";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { getPredictionsForImage } from "vision-camera-plugin-inatvision";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

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

const mockWatchPosition = jest.fn( ( success, _error, _options ) => success( {
  coords: {
    latitude: 56,
    longitude: 9,
    accuracy: 8
  }
} ) );
Geolocation.watchPosition.mockImplementation( mockWatchPosition );

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

beforeEach( ( ) => {
  useStore.setState( { isAdvancedUser: true } );
  const prediction = mockModelResult.predictions[0];
  jest.spyOn( useOfflineSuggestions, "default" ).mockImplementation( ( ) => ( {
    offlineSuggestions: [{
      score: prediction.score,
      taxon: {
        id: Number( prediction.taxon_id ),
        name: prediction.name,
        rank_level: prediction.rank_level
      }
    }]
  } ) );
} );

describe( "Photo Deletion", ( ) => {
  const actor = userEvent.setup( );

  async function startApp() {
    renderApp( );
    expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
  }

  async function takePhotoForNewObs() {
    const tabBar = await screen.findByTestId( "CustomTabBar" );
    const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
    await actor.press( addObsButton );
    const cameraButton = await screen.findByLabelText( "Camera" );
    await actor.press( cameraButton );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
  }

  async function deletePhotoInMediaViewer() {
    const deleteButton = await screen.findByLabelText( "Delete photo" );
    await actor.press( deleteButton );
    const warningSheet = await screen.findByTestId( "MediaViewer.DiscardMediaWarningSheet" );
    const discardButton = await within( warningSheet ).findByText( "DISCARD" );
    await actor.press( discardButton );
  }

  async function confirmPhotosAndAddTopId() {
    const checkmarkButton = await screen.findByLabelText( "View suggestions" );
    await actor.press( checkmarkButton );
    await screen.findByText( /You are offline/ );
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${mockModelResult.predictions[0].taxon_id}.checkmark`
    );
    await actor.press( topTaxonResultButton );
  }

  async function saveAndEditObs() {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    expect( evidenceTitle ).toBeVisible( );
    const saveButton = await screen.findByText( "SAVE" );
    await actor.press( saveButton );
    // Wait until header shows that there's an obs to upload
    await screen.findByText( /Upload \d observation/ );
    // await screen.findByLabelText( "Grid layout" );
    const obsListItems = await screen.findAllByTestId( /MyObservations\.obsListItem\..*/ );
    await actor.press( obsListItems[0] );
  }

  async function expectNoPhotosInStandardCamera() {
    const noPhotoText = await screen.findByText( "Photos you take will appear here" );
    expect( noPhotoText ).toBeVisible( );
  }

  async function viewPhotoFromObsEdit() {
    const evidenceItem = await screen.findByLabelText( "Select or drag media" );
    expect( evidenceItem ).toBeTruthy( );
    expect( evidenceItem ).toBeVisible( );
    await actor.press( evidenceItem );
  }

  async function expectObsEditToHaveNoPhotos() {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    expect( evidenceTitle ).toBeVisible( );
    // Confirm there is no evidence
    const evidenceItems = screen.queryAllByLabelText( "Select or drag media" );
    expect( evidenceItems.length ).toEqual( 0 );
  }

  it( "should delete from StandardCamera for new photo", async ( ) => {
    await startApp();
    await takePhotoForNewObs();
    // Tap the photo preview to enter the MediaViewer
    const carouselPhoto = await screen.findByTestId( /PhotoCarousel\.displayPhoto/ );
    await actor.press( carouselPhoto );
    await deletePhotoInMediaViewer();
    await expectNoPhotosInStandardCamera();
  } );

  it( "should delete from StandardCamera for existing photo", async ( ) => {
    await startApp();
    await takePhotoForNewObs();
    await confirmPhotosAndAddTopId();
    await saveAndEditObs();
    // Enter camera to add new photo
    const addEvidenceButton = await screen.findByLabelText( "Add evidence" );
    await actor.press( addEvidenceButton );
    const addEvidenceSheet = await screen.findByTestId( "AddEvidenceSheet" );
    const cameraButton = await within( addEvidenceSheet ).findByLabelText( "Camera" );
    await actor.press( cameraButton );
    // Tap the photo preview to enter the MediaViewer
    const carouselPhoto = await screen.findByTestId( /PhotoCarousel\.displayPhoto/ );
    await actor.press( carouselPhoto );
    await deletePhotoInMediaViewer();
    await expectNoPhotosInStandardCamera();
  } );

  it( "should delete from ObsEdit for new camera photo", async ( ) => {
    await startApp();
    await takePhotoForNewObs();
    await confirmPhotosAndAddTopId();
    await viewPhotoFromObsEdit();
    await deletePhotoInMediaViewer( );
    await expectObsEditToHaveNoPhotos();
  } );

  it( "should delete from ObsEdit for existing camera photo", async ( ) => {
    await startApp();
    await takePhotoForNewObs();
    await confirmPhotosAndAddTopId();
    await saveAndEditObs();
    await viewPhotoFromObsEdit();
    await deletePhotoInMediaViewer( );
    await expectObsEditToHaveNoPhotos();
  } );

  // TODO these will require mocking react-native-image-picker
  it.todo( "should delete from ObsEdit for new gallery photo" );
  it.todo( "should delete from ObsEdit for existing gallery photo" );
} );
