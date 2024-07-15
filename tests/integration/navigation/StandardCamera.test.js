import Geolocation from "@react-native-community/geolocation";
import {
  screen,
  userEvent,
  within
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
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

beforeAll( async () => {
  await initI18next();
  jest.useFakeTimers( );
} );

beforeEach( ( ) => useStore.setState( { isAdvancedUser: true } ) );

describe( "StandardCamera navigation with advanced user layout", ( ) => {
  const actor = userEvent.setup( );

  describe( "from MyObs", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
      const tabBar = await screen.findByTestId( "CustomTabBar" );
      const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
      await actor.press( addObsButton );
      const cameraButton = await screen.findByLabelText( "Camera" );
      await actor.press( cameraButton );
      const cameraNavButtons = await screen.findByTestId( "CameraNavButtons" );
      const closeButton = await within( cameraNavButtons ).findByLabelText( "Close" );
      await actor.press( closeButton );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
    } );
  } );

  it( "should advance to Suggestions when photo taken and checkmark tapped", async ( ) => {
    const mockGetCurrentPosition = jest.fn( ( success, _error, _options ) => success( {
      coords: {
        latitude: 56,
        longitude: 9
      }
    } ) );
    Geolocation.getCurrentPosition.mockImplementation( mockGetCurrentPosition );
    renderApp( );
    expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
    const tabBar = await screen.findByTestId( "CustomTabBar" );
    const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
    await actor.press( addObsButton );
    const cameraButton = await screen.findByLabelText( "Camera" );
    await actor.press( cameraButton );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
    const checkmarkButton = await screen.findByLabelText( "View suggestions" );
    await actor.press( checkmarkButton );
    expect( await screen.findByText( /ADD AN ID/ ) ).toBeVisible( );
  } );
} );
