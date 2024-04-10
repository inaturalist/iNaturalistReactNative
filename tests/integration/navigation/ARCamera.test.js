import Geolocation from "@react-native-community/geolocation";
import {
  screen,
  userEvent
} from "@testing-library/react-native";
import * as usePredictions from "components/Camera/ARCamera/hooks/usePredictions";
import initI18next from "i18n/initI18next";
import { renderApp } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url"
  }
};

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
      useRealm: ( ) => global.mockRealms[mockRealmIdentifier]
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

describe( "ARCamera navigation", ( ) => {
  const actor = userEvent.setup( );

  describe( "from MyObs", ( ) => {
    it( "should return to MyObs when close button tapped", async ( ) => {
      renderApp( );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
      const addObsButton = await screen.findByLabelText( "Add observations" );
      await actor.press( addObsButton );
      const cameraButton = await screen.findByLabelText( /AR Camera/ );
      await actor.press( cameraButton );
      expect( await screen.findByText( /Loading iNaturalist's AR Camera/ ) ).toBeVisible( );
      const closeButton = await screen.findByLabelText( /Close/ );
      await actor.press( closeButton );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
    } );
  } );

  describe( "to Suggestions", ( ) => {
    beforeEach( ( ) => {
      const mockGetCurrentPosition = jest.fn( ( success, _error, _options ) => success( {
        coords: {
          latitude: 56,
          longitude: 9
        }
      } ) );
      Geolocation.getCurrentPosition.mockImplementation( mockGetCurrentPosition );
    } );

    it( "should advance to suggestions and display top suggestion from ARCamera", async ( ) => {
      jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
        handleTaxaDetected: jest.fn( ),
        modelLoaded: true,
        result: {
          taxon: mockLocalTaxon
        }
      } ) );

      renderApp( );
      expect( await screen.findByText( /Log in to contribute/ ) ).toBeVisible( );
      const addObsButton = await screen.findByLabelText( "Add observations" );
      await actor.press( addObsButton );
      const cameraButton = await screen.findByLabelText( /AR Camera/ );
      await actor.press( cameraButton );
      expect( await screen.findByText( mockLocalTaxon.name ) ).toBeVisible( );
      const takePhotoButton = await screen.findByLabelText( /Take photo/ );
      await actor.press( takePhotoButton );
      expect( await screen.findByText( /ADD AN ID/ ) ).toBeVisible( );
      expect( await screen.findByText( mockLocalTaxon.name ) ).toBeVisible( );
    } );
  } );
} );
