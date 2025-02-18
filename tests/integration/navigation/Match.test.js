import Geolocation from "@react-native-community/geolocation";
import {
  screen,
  userEvent,
  waitFor,
  within
} from "@testing-library/react-native";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions.ts";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import * as useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithObservations } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";

jest.mock( "react-native/Libraries/Utilities/Platform", ( ) => ( {
  OS: "ios",
  select: jest.fn( ),
  Version: 11
} ) );

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

const makeUnsyncedObservations = options => ( [
  factory( "LocalObservation", {
    // Match won't load without a photo
    observationPhotos: [
      factory( "LocalObservationPhoto" )
    ],
    ...options
  } )
] );

const topSuggestion = {
  taxon: factory( "RemoteTaxon", { name: "Primum suggestion" } ),
  combined_score: 78
};

beforeEach( async ( ) => {
  useStore.setState( {
    layout: {
      isDefaultMode: true,
      shownOnce: {}
    },
    isAdvancedUser: false
  } );
} );

afterEach( ( ) => {
  inatjs.computervision.score_image.mockClear( );
} );

beforeAll( async () => {
  await initI18next();
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

describe( "Match", ( ) => {
  global.withAnimatedTimeTravelEnabled( { skipFakeTimers: true } );
  const actor = userEvent.setup( );

  async function navigateToMatchViaCamera( ) {
    const tabBar = await screen.findByTestId( "CustomTabBar" );
    const addObsButton = await within( tabBar ).findByLabelText( "Add observations" );
    await actor.press( addObsButton );
    const takePhotoButton = await screen.findByLabelText( /Take photo/ );
    await actor.press( takePhotoButton );
    const discardButton = await screen.findByText( /DISCARD/ );
    await waitFor( ( ) => {
      global.timeTravel( );
      expect( discardButton ).toBeVisible( );
    } );
  }

  describe( "when reached from Camera", ( ) => {
    beforeEach( ( ) => {
      inatjs.computervision.score_image
        .mockResolvedValue( makeResponse( [topSuggestion] ) );
      jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
        handleTaxaDetected: jest.fn( ),
        modelLoaded: true,
        result: {
          taxon: []
        },
        setResult: jest.fn( )
      } ) );
    } );

    it( "should show location permissions button if permissions not granted", async ( ) => {
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: false,
        renderPermissionsGate: jest.fn( )
      } ) );
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToMatchViaCamera( );
      const addLocationButton = screen.queryByText( /ADD LOCATION FOR BETTER IDS/ );
      expect( addLocationButton ).toBeVisible( );
    } );

    it( "should not show location permissions button if permissions granted", async ( ) => {
      const mockWatchPosition = jest.fn( ( success, _error, _options ) => success( {
        coords: {
          latitude: 56,
          longitude: 9,
          accuracy: 8
        }
      } ) );
      Geolocation.watchPosition.mockImplementation( mockWatchPosition );
      jest.spyOn( useLocationPermission, "default" ).mockImplementation( ( ) => ( {
        hasPermissions: true,
        renderPermissionsGate: jest.fn( )
      } ) );
      const observations = makeUnsyncedObservations( );
      await renderAppWithObservations( observations, __filename );
      await navigateToMatchViaCamera( );
      const addLocationButton = screen.queryByText( /ADD LOCATION FOR BETTER IDS/ );
      expect( addLocationButton ).toBeFalsy( );
    } );
  } );
} );
