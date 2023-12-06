import {
  screen,
  userEvent
} from "@testing-library/react-native";
import initI18next from "i18n/initI18next";
import os from "os";
import path from "path";
import Realm from "realm";
import realmConfig from "realmModels/index";
import useStore from "stores/useStore";

import factory from "../../factory";
import { renderObservationsStackNavigatorWithObservations } from "../../helpers/render";
import { signIn, signOut } from "../../helpers/user";

const initialStoreState = useStore.getState( );

// We're explicitly testing navigation here so we want react-navigation
// working normally
jest.unmock( "@react-navigation/native" );

// This is a bit crazy, but this ensures this test uses its own in-memory
// database and doesn't interfere with the single, default in-memory database
// used by other tests. In a perfect world, every parallel test worker would
// have its own database, or at least this wouldn't be so manual, but it took
// me long enough to figure this out. ~~~kueda 20231024
// REALM SETUP
const mockRealmConfig = {
  schema: realmConfig.schema,
  schemaVersion: realmConfig.schemaVersion,
  // No need to actually write to disk
  inMemory: true,
  // For an in memory db path is basically a unique identifier, *but* Realm
  // may still write some metadata to disk, so this needs to be a real, but
  // temporary, path. In theory this should prevent this test from
  // interacting with other tests
  path: path.join( os.tmpdir( ), `${path.basename( __filename )}.realm` )
};

// Mock the config so that all code that runs during this test talks to the same database
jest.mock( "realmModels/index", ( ) => ( {
  __esModule: true,
  default: mockRealmConfig
} ) );

jest.mock( "providers/contexts", ( ) => {
  const originalModule = jest.requireActual( "providers/contexts" );
  return {
    __esModule: true,
    ...originalModule,
    RealmContext: {
      ...originalModule.RealmContext,
      useRealm: ( ) => global.mockRealms[__filename]
    }
  };
} );

// Open a realm connection and stuff it in global
beforeAll( async ( ) => {
  global.mockRealms = global.mockRealms || {};
  global.mockRealms[__filename] = await Realm.open( mockRealmConfig );
  useStore.setState( initialStoreState, true );
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

const mockUser = factory( "LocalUser" );

describe( "MediaViewer navigation", ( ) => {
  const actor = userEvent.setup( );

  beforeAll( async () => {
    await initI18next();
  } );

  beforeEach( async ( ) => {
    await signIn( mockUser );
  } );

  afterEach( ( ) => {
    signOut( );
  } );

  describe( "from ObsEdit", ( ) => {
    it( "should show the first photo when tapped", async ( ) => {
      const observation = factory( "LocalObservation", {
        _synced_at: null,
        observationPhotos: [
          factory( "LocalObservationPhoto" )
        ]
      } );
      expect( observation.observationPhotos.length ).toBeGreaterThan( 0 );
      const observations = [observation];
      useStore.setState( { observations } );
      await renderObservationsStackNavigatorWithObservations( observations, __filename );
      const observationRow = await screen.findByTestId(
        `MyObservations.obsListItem.${observation.uuid}`
      );
      await actor.press( observationRow );
      const obsEditPhotos = await screen.findAllByTestId( "ObsEdit.photo" );
      expect( obsEditPhotos.length ).toEqual( observation.observationPhotos.length );
      await actor.press( obsEditPhotos[0] );
      expect(
        await screen.findByTestId( `CustomImageZoom.${observation.observationPhotos[0].photo.url}` )
      ).toBeVisible( );
    } );
    it.todo( "should show the not show the first photo when second tapped" );
    it.todo( "should show delete button" );
  } );
  describe( "from StandardCamera", ( ) => {
    it.todo( "should show the first photo when tapped" );
    it.todo( "should show the not show the first photo when second tapped" );
    it.todo( "should show delete button" );
  } );
  describe( "from ObsDetail", ( ) => {
    it.todo( "should show the first photo when tapped" );
    it.todo( "should show the not show the first photo when second tapped" );
    it.todo( "should show not delete button" );
  } );
} );
