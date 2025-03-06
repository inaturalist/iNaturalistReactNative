import {
  useNetInfo
} from "@react-native-community/netinfo";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import Settings from "components/Settings/Settings";
import i18n from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import * as useCurrentUser from "sharedHooks/useCurrentUser.ts";
import useStore from "stores/useStore";
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

const initialStoreState = useStore.getState( );

// TODO: this will be required when the advanced interface mode is toggled off by default
// const toggleAdvancedMode = async ( ) => {
//   const advancedRadioButton = await screen
//     .findByText( /Advanced/ );
//   fireEvent.press( advancedRadioButton );
// };

beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  // reset the picker for each test
  i18n.changeLanguage( "en" );
  inatjs.users.me.mockResolvedValue( makeResponse( [mockUser] ) );
  inatjs.translations.locales.mockResolvedValue( makeResponse( [{
    language_in_locale: "Slovenský",
    locale: "sk"
  }, {
    language_in_locale: "Español (Colombia)",
    locale: "es-CO"
  }] ) );
} );

describe( "Settings", ( ) => {
  it( "should toggle the green observation button", async ( ) => {
    renderComponent( <Settings /> );
    // await toggleAdvancedMode( );
    const allObsOptions = await screen.findByLabelText( /All observation options/ );
    expect( allObsOptions ).toHaveProp( "accessibilityState", expect.objectContaining( {
      checked: true
    } ) );
    const aiCameraRow = await screen.findByLabelText( "iNaturalist AI Camera" );
    expect( aiCameraRow ).toHaveProp( "accessibilityState", expect.objectContaining( {
      checked: false
    } ) );
    fireEvent.press( aiCameraRow );
    expect( aiCameraRow ).toHaveProp( "accessibilityState", expect.objectContaining( {
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
      // await toggleAdvancedMode( );
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
      const iNatSettingsButton = await screen.findByText( "ACCOUNT SETTINGS" );
      fireEvent.press( iNatSettingsButton );
      expect( mockNavigate ).toHaveBeenCalledWith(
        "FullPageWebView",
        expect.objectContaining( {
          loggedIn: true
        } )
      );
    } );

    describe( "no internet", ( ) => {
      beforeEach( ( ) => {
        useNetInfo.mockImplementation( ( ) => ( { isConnected: false } ) );
      } );

      it( "should not change state if taxon names toggled with no internet", async ( ) => {
        renderComponent( <Settings /> );
        // await toggleAdvancedMode( );
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
        const iNatSettingsButton = await screen.findByText( "ACCOUNT SETTINGS" );
        fireEvent.press( iNatSettingsButton );
        expect( mockNavigate ).not.toHaveBeenCalled( );
      } );
    } );
  } );

  test( "should change language immediately via language picker via online results", async ( ) => {
    renderComponent( <Settings /> );
    // await toggleAdvancedMode( );
    const changeLanguageButton = await screen.findByText( /CHANGE APP LANGUAGE/ );
    fireEvent.press( changeLanguageButton );
    const picker = await screen.findByTestId( "ReactNativePicker" );
    // English is number 11 in the list of offline locales
    expect( picker.props.selectedIndex ).toStrictEqual( 0 );
    // trigger a change to the UI, selecting the second element
    fireEvent( picker, "onValueChange", "es-CO" );
    expect( picker.props.selectedIndex ).toStrictEqual( 1 );
    const confirmText = await screen.findByText( "CONFIRM" );
    fireEvent.press( confirmText );
    const columbianSpanishSciNameText = await screen.findByText( /Nombre científico/ );
    expect( columbianSpanishSciNameText ).toBeVisible( );
  } );
} );
