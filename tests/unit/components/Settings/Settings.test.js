import {
  useNetInfo
} from "@react-native-community/netinfo";
import { fireEvent, screen } from "@testing-library/react-native";
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

const toggleAdvancedSwitch = async ( ) => {
  const advancedSwitch = await screen.findByTestId( "advanced-interface-switch.switch" );
  fireEvent.press( advancedSwitch );
};

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
  it( "should toggle the green observation button from all options -> AICamera", async ( ) => {
    renderComponent( <Settings /> );
    await toggleAdvancedSwitch( );
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
    const columbianSpanishSciNameTexts = await screen.findAllByText( /Nombre científico/ );
    expect( columbianSpanishSciNameTexts.length ).toBeGreaterThan( 0 );
    expect( columbianSpanishSciNameTexts[0] ).toBeVisible( );
  } );
} );
