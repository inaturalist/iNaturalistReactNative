import {
  useNetInfo
} from "@react-native-community/netinfo";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import Settings from "components/Settings/Settings";
import inatjs from "inaturalistjs";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import factory, { makeResponse } from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "LocalUser" );

const mockNavigate = jest.fn( );
jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useNavigation: ( ) => ( {
      navigate: mockNavigate
    } )
  };
} );

beforeEach( ( ) => {
  inatjs.users.me.mockResolvedValue( makeResponse( [mockUser] ) );
} );

describe( "Settings", ( ) => {
  it( "should toggle the green observation button", async ( ) => {
    renderComponent( <Settings /> );
    const aiCameraRow = await screen.findByLabelText( "iNaturalist AI Camera" );
    expect( aiCameraRow ).toHaveProp( "accessibilityState", expect.objectContaining( {
      checked: true
    } ) );
    const allObsOptions = await screen.findByLabelText( /All observation options/ );
    expect( allObsOptions ).toHaveProp( "accessibilityState", expect.objectContaining( {
      checked: false
    } ) );
    fireEvent.press( allObsOptions );
    expect( allObsOptions ).toHaveProp( "accessibilityState", expect.objectContaining( {
      checked: true
    } ) );
  } );

  describe( "is logged in", ( ) => {
    beforeEach( ( ) => {
      jest.spyOn( useCurrentUser, "default" ).mockImplementation( () => mockUser );
    } );

    afterEach( ( ) => {
      jest.clearAllMocks( );
    } );

    it( "should toggle taxon names display", async ( ) => {
      renderComponent( <Settings /> );
      const sciNameFirst = await screen.findByLabelText( "Scientific Name (Common Name)" );
      expect( sciNameFirst ).toHaveProp( "accessibilityState", expect.objectContaining( {
        checked: false
      } ) );
      fireEvent.press( sciNameFirst );
      inatjs.users.me.mockResolvedValue( makeResponse( [{
        ...mockUser,
        prefers_scientific_name_first: true,
        prefers_common_names: true
      }] ) );
      expect( inatjs.users.me ).toHaveBeenCalled( );
      await waitFor( ( ) => {
        expect( sciNameFirst ).toHaveProp( "accessibilityState", expect.objectContaining( {
          checked: true
        } ) );
      } );
    } );

    it( "should navigate user to iNaturalist settings", async ( ) => {
      renderComponent( <Settings /> );
      const iNatSettingsButton = await screen.findByText( /INATURALIST SETTINGS/ );
      fireEvent.press( iNatSettingsButton );
      expect( mockNavigate ).toHaveBeenCalledWith(
        "FullPageWebView",
        expect.objectContaining( {
          loggedIn: true,
          openLinksInBrowser: true
        } )
      );
    } );

    describe( "no internet", ( ) => {
      beforeEach( ( ) => {
        useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      } );

      it( "should not change state if taxon names toggled with no internet", async ( ) => {
        renderComponent( <Settings /> );
        const sciNameFirst = await screen.findByLabelText( "Scientific Name (Common Name)" );
        expect( sciNameFirst ).toHaveProp( "accessibilityState", expect.objectContaining( {
          checked: false
        } ) );
        fireEvent.press( sciNameFirst );
        inatjs.users.update.mockImplementation( () => {
          throw new Error( "no internet" );
        } );
        expect( inatjs.users.update ).not.toHaveBeenCalled( );
        expect( sciNameFirst ).toHaveProp( "accessibilityState", expect.objectContaining( {
          checked: false
        } ) );
      } );

      it( "should not navigate to iNaturalist settings if no internet", async ( ) => {
        renderComponent( <Settings /> );
        const iNatSettingsButton = await screen.findByText( /INATURALIST SETTINGS/ );
        fireEvent.press( iNatSettingsButton );
        expect( mockNavigate ).not.toHaveBeenCalled( );
      } );
    } );
  } );
} );
