import "tests/helpers/mockMortalForIntegration";

import {
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice";
import {
  navigateToStandardCameraFromMyObs,
} from "tests/helpers/addObsBottomSheet";
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
  setStoreStateLayout( {
    isDefaultMode: false,
    isAllAddObsOptionsMode: true,
  } );
} );

const actor = userEvent.setup( );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 56, longitude: 9, accuracy: 8 } ) );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation(),
} ) );

describe( "StandardCamera navigation with advanced user layout", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );

  beforeEach( () => {
    setStoreStateLayout( {
      isDefaultMode: false,
      isAllAddObsOptionsMode: true,
      screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT,
    } );
  } );

  describe( "from MyObs", ( ) => {
    it( "should leave the camera when close button tapped", async ( ) => {
      renderApp( );
      await navigateToStandardCameraFromMyObs( );
      const cameraNavButtons = await screen.findByTestId( "CameraNavButtons" );
      const closeButton = await within( cameraNavButtons ).findByLabelText( "Close" );
      await actor.press( closeButton );
      await waitFor( ( ) => {
        global.timeTravel( 300 );
        expect( screen.queryByTestId( "CameraNavButtons" ) ).toBeNull( );
        // TODO: This used to be an expect like so, idk why that fails now
        // expect( screen.getByText( /Use iNaturalist to identify/ ) ).toBeVisible( );
      } );
    } );
  } );

  it( "should advance to ObsEdit when photo taken and checkmark tapped", async () => {
    renderApp( );
    await navigateToStandardCameraFromMyObs( );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
    const checkmarkButton = await screen.findByLabelText( "View suggestions" );
    await actor.press( checkmarkButton );
    await waitFor( ( ) => {
      global.timeTravel( 300 );
      expect( screen.getByText( /New Observation/ ) ).toBeVisible( );
    } );
  } );

  describe( "when navigating to Suggestions", ( ) => {
    beforeEach( () => {
      setStoreStateLayout( {
        isDefaultMode: false,
        screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
        isAllAddObsOptionsMode: true,
      } );
    } );

    it( "should advance to Suggestions when photo taken and checkmark tapped", async ( ) => {
      renderApp( );
      await navigateToStandardCameraFromMyObs( );
      const takePhotoButton = await screen.findByLabelText( /Take photo/ );
      await actor.press( takePhotoButton );
      const checkmarkButton = await screen.findByLabelText( "View suggestions" );
      await actor.press( checkmarkButton );
      await waitFor( ( ) => {
        global.timeTravel( 300 );
        expect( screen.getByText( /ADD AN ID/ ) ).toBeVisible( );
      } );
    } );
  } );
} );
