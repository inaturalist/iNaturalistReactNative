import { fireEvent, screen } from "@testing-library/react-native";
import LanguageSetting from "components/Settings/LanguageSetting";
import i18n from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import useStore from "stores/useStore";
import { makeResponse } from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

beforeAll( async ( ) => {
  useStore.setState( initialStoreState, true );
  // userEvent recommends fake timers
  jest.useFakeTimers( );
} );

beforeEach( ( ) => {
  // reset the picker for each test
  i18n.changeLanguage( "en" );
} );

describe( "LanguageSetting", ( ) => {
  it( "should display and allow user to change locales from web list", async ( ) => {
    inatjs.translations.locales.mockResolvedValue( makeResponse( [{
      language_in_locale: "Slovenský",
      locale: "sk"
    }, {
      language_in_locale: "Español (Colombia)",
      locale: "es-CO"
    }] ) );

    renderComponent( <LanguageSetting onChange={jest.fn( )} /> );

    expect( i18n.language ).toEqual( "en" );
    const changeLanguageButton = await screen.findByText( /CHANGE APP LANGUAGE/ );
    expect( changeLanguageButton ).toBeVisible( );
    fireEvent.press( changeLanguageButton );

    const picker = await screen.findByTestId( "ReactNativePicker" );
    expect( picker ).toBeVisible( );

    expect( picker.props.selectedIndex ).toStrictEqual( 0 );
    // trigger a change to the UI, selecting the second element
    fireEvent( picker, "onValueChange", "es-CO" );
    expect( picker.props.selectedIndex ).toStrictEqual( 1 );
    const confirmText = await screen.findByText( "CONFIRM" );
    expect( confirmText ).toBeVisible( );
    fireEvent.press( confirmText );
    expect( i18n.language ).toEqual( "es-CO" );
  } );
} );
