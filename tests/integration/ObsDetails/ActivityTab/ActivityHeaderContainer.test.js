import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import ActivityHeaderContainer from "components/ObsDetails/ActivityTab/ActivityHeaderContainer";
import inatjs from "inaturalistjs";
import React from "react";
import factory, { makeResponse } from "tests/factory";
import { renderComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

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

const mockUser = factory( "LocalUser" );

describe( "ActivityHeaderContainer", ( ) => {
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
          factory( "RemoteIdentification", { user: mockUser, current: false } ),
        ] ),
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
              body: expect.anything( ),
            } ),
          } ),
          // Second arg is the options that contain auth info
          expect.any( Object ),
        );
      } );
    } );
  } );

  describe( "restore ID", ( ) => {
    it( "should update the identification's current attribute to false", async ( ) => {
      const mockIdentification = factory( "RemoteIdentification", {
        user: mockUser,
        current: false,
      } );
      renderComponent( <ActivityHeaderContainer item={mockIdentification} /> );
      const kebabButton = await screen.findByLabelText( "Identification options" );
      fireEvent.press( kebabButton );
      const restoreButton = await screen.findByText( "Restore" );
      inatjs.identifications.update.mockResolvedValue(
        makeResponse( [
          factory( "RemoteIdentification", { user: mockUser, current: true } ),
        ] ),
      );
      fireEvent.press( restoreButton );
      await waitFor( ( ) => {
        expect( inatjs.identifications.update ).toHaveBeenCalledWith(
          // First arg is the required params object
          expect.objectContaining( {
            // Don't care about fields here
            fields: expect.any( Object ),
            identification: expect.objectContaining( {
              current: true,
            } ),
          } ),
          // Second arg is the options that contain auth info
          expect.any( Object ),
        );
      } );
    } );
  } );
} );
