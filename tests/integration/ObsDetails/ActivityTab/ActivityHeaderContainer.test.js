import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ActivityHeaderContainer from "components/ObsDetails/ActivityTab/ActivityHeaderContainer";
import initI18next from "i18n/initI18next";
import inatjs from "inaturalistjs";
import os from "os";
import path from "path";
import React from "react";
import Realm from "realm";
import realmConfig from "realmModels/index";
import factory, { makeResponse } from "tests/factory";
import { renderComponent } from "tests/helpers/render";
import { signIn, signOut } from "tests/helpers/user";

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

const mockUser = factory( "LocalUser" );

describe( "ActivityHeaderContainer", ( ) => {
  beforeAll( async () => {
    await initI18next( );
  } );

  beforeEach( ( ) => {
    signIn( mockUser, { realm: global.mockRealms[__filename] } );
  } );

  afterEach( () => {
    jest.clearAllMocks();
    signOut( { realm: global.mockRealms[__filename] } );
  } );

  describe( "withdraw ID", ( ) => {
    it( "should request an update to the identification without touching the body", async ( ) => {
      const mockIdentification = factory( "RemoteIdentification", { user: mockUser } );
      renderComponent( <ActivityHeaderContainer item={mockIdentification} /> );
      const kebabButton = await screen.findByLabelText( "Identification options" );
      fireEvent.press( kebabButton );
      const withdrawButton = await screen.findByText( "Withdraw" );
      fireEvent.press( withdrawButton );
      const bottomSheetButton = await screen.findByText( "WITHDRAW ID" );
      inatjs.identifications.update.mockResolvedValue(
        makeResponse( [
          factory( "RemoteIdentification", { user: mockUser, current: false } )
        ] )
      );
      fireEvent.press( bottomSheetButton );
      await waitFor( ( ) => {
        expect( inatjs.identifications.update ).toHaveBeenCalledWith(
          // First arg is the required params object
          expect.objectContaining( {
            // Don't care about fields here
            fields: expect.any( Object ),
            // We do want to make sure the identification object does not contain a body
            identification: expect.not.objectContaining( {
              body: expect.anything( )
            } )
          } ),
          // Second arg is the options that contain auth info
          expect.any( Object )
        );
      } );
    } );
  } );

  describe( "restore ID", ( ) => {
    it( "should update the identification's current attribute to false", async ( ) => {
      const mockIdentification = factory( "RemoteIdentification", {
        user: mockUser,
        current: false
      } );
      renderComponent( <ActivityHeaderContainer item={mockIdentification} /> );
      const kebabButton = await screen.findByLabelText( "Identification options" );
      fireEvent.press( kebabButton );
      const restoreButton = await screen.findByText( "Restore" );
      inatjs.identifications.update.mockResolvedValue(
        makeResponse( [
          factory( "RemoteIdentification", { user: mockUser, current: true } )
        ] )
      );
      fireEvent.press( restoreButton );
      await waitFor( ( ) => {
        expect( inatjs.identifications.update ).toHaveBeenCalledWith(
          // First arg is the required params object
          expect.objectContaining( {
            // Don't care about fields here
            fields: expect.any( Object ),
            identification: expect.objectContaining( {
              current: true
            } )
          } ),
          // Second arg is the options that contain auth info
          expect.any( Object )
        );
      } );
    } );
  } );
} );
