import { screen, waitFor } from "@testing-library/react-native";
import ObsDetailsContainer from "components/ObsDetails/ObsDetailsContainer";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import os from "os";
import path from "path";
import React from "react";
import Realm from "realm";
import realmConfig from "realmModels/index";
import Observation from "realmModels/Observation";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";

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
} );

// Ensure the realm connection gets closed
afterAll( ( ) => {
  global.mockRealms[__filename]?.close( );
  jest.clearAllMocks( );
} );
// /REALM SETUP

const mockComment = factory( "RemoteComment" );
const mockObservation = factory( "RemoteObservation", {
  comments: [mockComment]
} );
const mockUpdate = factory( "RemoteUpdate", {
  resource_uuid: mockObservation.uuid,
  comment_id: mockComment.id,
  viewed: false
} );

// Mock api call to fetch observation so it looks like a remote copy exists
inatjs.observations.fetch.mockResolvedValue( makeResponse( [mockObservation] ) );

// Mock api call to observations
jest.mock( "inaturalistjs" );
inatjs.observations.update.mockResolvedValue( makeResponse( [mockUpdate] ) );

jest.mock( "@react-navigation/native", () => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    addEventListener: () => {},
    useNavigation: () => ( {
      navigate: jest.fn(),
      setOptions: jest.fn(),
      canGoBack: jest.fn( ( ) => true )
    } ),
    useRoute: () => ( {
      params: {
        uuid: mockObservation.uuid
      }
    } )
  };
} );

describe( "ObsDetails", () => {
  beforeAll( async () => {
    await initI18next();
    jest.useFakeTimers( );
    Observation.upsertRemoteObservations( [mockObservation], global.mockRealms[__filename] );
  } );

  afterEach( () => {
    jest.clearAllMocks();
  } );

  describe( "with an observation where we don't know if the user has viewed comments", ( ) => {
    it( "should make a request to observation/viewedUpdates", async ( ) => {
      // Let's make sure the mock hasn't already been used
      expect( inatjs.observations.viewedUpdates ).not.toHaveBeenCalled();
      const observation = global.mockRealms[__filename].objectForPrimaryKey(
        "Observation",
        mockObservation.uuid
      );
      // Expect the observation in realm to have comments_viewed param not initialized
      expect( observation.comments_viewed ).not.toBeTruthy();
      renderAppWithComponent( <ObsDetailsContainer /> );
      expect(
        await screen.findByText( `@${observation.user.login}` )
      ).toBeTruthy();
      await waitFor( ( ) => {
        expect( inatjs.observations.viewedUpdates ).toHaveBeenCalledTimes( 1 );
      } );
      // Expect the observation in realm to have been updated with comments_viewed = true
      expect( observation.comments_viewed ).toBe( true );
    } );
  } );
} );
