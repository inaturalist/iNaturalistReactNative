import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import * as ImagePicker from "react-native-image-picker";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";
import { renderApp } from "tests/helpers/render";
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
      fileName: mockFileName
    }
  ]
};

const mockImageLibraryResponseMultiplePhotos = {
  assets: [
    {
      uri: "some_uri",
      fileName: "some_file_name"
    },
    {
      uri: mockUri,
      fileName: mockFileName
    }
  ]
};

jest.mock( "react-native-image-picker", ( ) => ( {
  launchImageLibrary: jest.fn( ( ) => mockImageLibraryResponse )
} ) );

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

const mockUser = factory( "LocalUser" );
// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: jest.fn( () => mockUser )
} ) );

// Mock the response from inatjs.computervision.score_image
const topSuggestion = {
  taxon: factory.states( "genus" )( "RemoteTaxon", { name: "Primum" } ),
  combined_score: 90
};

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: false,
      isAdvancedSuggestionsMode: true,
      screenAfterPhotoEvidence: "Suggestions"
    },
    isAdvancedUser: true
  } );
  inatjs.computervision.score_image.mockResolvedValue( makeResponse( [topSuggestion] ) );
} );

describe( "Photo Import", ( ) => {
  const actor = userEvent.setup( );

  async function importPhotoForNewObs() {
    const tabBar = await screen.findByTestId( "CustomTabBar" );
    const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
    await actor.press( addObsButton );
    const photoImportButton = await within( tabBar ).findByLabelText( "Photo importer" );
    await actor.press( photoImportButton );
  }

  async function groupPhotosIntoObservation() {
    const groupPhotosText = await screen.findByText( /Group Photos/ );
    expect( groupPhotosText ).toBeVisible( );
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

  async function viewSuggestionsAndAddId() {
    const topTaxonResultButton = await screen.findByTestId(
      `SuggestionsList.taxa.${topSuggestion.taxon.id}.checkmark`
    );
    await actor.press( topTaxonResultButton );
  }

  async function saveObservationWithPhoto() {
    // Make sure we're on ObsEdit
    const evidenceTitle = await screen.findByText( "EVIDENCE" );
    expect( evidenceTitle ).toBeVisible( );

    const localFilePath = `file://document/directory/path/photoUploads/${mockFileName}`;
    const photoEvidence = await screen.findByTestId( `EvidenceList.${localFilePath}` );
    expect( photoEvidence ).toBeVisible( );
    const saveButton = await screen.findByText( "SAVE" );
    await actor.press( saveButton );
    const okButton = await screen.findByText( "OK" );
    await actor.press( okButton );
    await actor.press( saveButton );
    // Wait until header shows that there's an obs to upload
    await screen.findByText( /Upload \d observation/ );
    const obsGridItems = await screen.findAllByTestId( /MyObservations\.obsGridItem\..*/ );
    await waitFor( () => {
      expect( obsGridItems[0] ).toBeVisible( );
    }, { timeout: 3_000, interval: 500 } );
  }

  it( "should create and save an observation with an imported photo", async ( ) => {
    renderApp( );
    await importPhotoForNewObs( );
    await viewSuggestionsAndAddId( );
    await saveObservationWithPhoto( );
  } );

  it( "should create and save an observation with multiple imported photos", async ( ) => {
    jest.spyOn( ImagePicker, "launchImageLibrary" ).mockImplementation(
      ( ) => mockImageLibraryResponseMultiplePhotos
    );
    renderApp( );
    await importPhotoForNewObs( );
    await groupPhotosIntoObservation( );
    await viewSuggestionsAndAddId( );
    await saveObservationWithPhoto( );
  } );
} );
