import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import { SCREEN_AFTER_PHOTO_EVIDENCE } from "stores/createLayoutSlice.ts";
import useStore from "stores/useStore";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

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

const initialState = useStore.getInitialState();
beforeAll( async () => {
  await initI18next();
  useStore.setState( {
    layout: {
      ...initialState.layout,
      isDefaultMode: false,
      isAllAddObsOptionsMode: true
    }
  } );
} );

const actor = userEvent.setup( );

const mockFetchUserLocation = jest.fn( () => ( { latitude: 56, longitude: 9, accuracy: 8 } ) );
jest.mock( "sharedHelpers/fetchAccurateUserLocation", () => ( {
  __esModule: true,
  default: () => mockFetchUserLocation()
} ) );

const navigateToCamera = async ( ) => {
  await waitFor( ( ) => {
    global.timeTravel( );
    expect( screen.getByText( /Use iNaturalist to identify/ ) ).toBeVisible( );
  } );
  const tabBar = await screen.findByTestId( "CustomTabBar" );
  const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
  await actor.press( addObsButton );
  const cameraButton = await screen.findByLabelText( "Camera" );
  await actor.press( cameraButton );
};

describe( "StandardCamera navigation with advanced user layout", ( ) => {
  global.withAnimatedTimeTravelEnabled( );
  beforeEach( () => {
    useStore.setState( {
      layout: {
        ...initialState.layout,
        isDefaultMode: false,
        isAllAddObsOptionsMode: true,
        screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.OBS_EDIT
      }
    } );
  } );

  describe( "from MyObs", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      await navigateToCamera( );
      const cameraNavButtons = await screen.findByTestId( "CameraNavButtons" );
      const closeButton = await within( cameraNavButtons ).findByLabelText( "Close" );
      await actor.press( closeButton );
      await waitFor( ( ) => {
        global.timeTravel( );
        expect( screen.getByText( /Use iNaturalist to identify/ ) ).toBeVisible( );
      } );
    } );
  } );

  it( "should advance to ObsEdit when photo taken and checkmark tapped", async () => {
    renderApp( );
    await navigateToCamera( );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
    const checkmarkButton = await screen.findByLabelText( "View suggestions" );
    await actor.press( checkmarkButton );
    await waitFor( ( ) => {
      global.timeTravel( );
      expect( screen.getByText( /New Observation/ ) ).toBeVisible( );
    } );
  } );

  describe( "when navigating to Suggestions", ( ) => {
    beforeEach( () => {
      useStore.setState( {
        layout: {
          ...initialState.layout,
          isDefaultMode: false,
          screenAfterPhotoEvidence: SCREEN_AFTER_PHOTO_EVIDENCE.SUGGESTIONS,
          isAllAddObsOptionsMode: true
        }
      } );
    } );

    it( "should advance to Suggestions when photo taken and checkmark tapped", async ( ) => {
      renderApp( );
      await navigateToCamera( );
      const takePhotoButton = await screen.findByLabelText( /Take photo/ );
      await actor.press( takePhotoButton );
      const checkmarkButton = await screen.findByLabelText( "View suggestions" );
      await actor.press( checkmarkButton );
      await waitFor( ( ) => {
        global.timeTravel( );
        expect( screen.getByText( /ADD AN ID/ ) ).toBeVisible( );
      } );
    } );
  } );
} );
