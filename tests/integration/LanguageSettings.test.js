import { fireEvent, screen } from "@testing-library/react-native";
import Settings from "components/Settings/Settings";
import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import React from "react";
import factory, { makeResponse } from "tests/factory";
import { renderAppWithComponent } from "tests/helpers/render";
import setupUniqueRealm from "tests/helpers/uniqueRealm";
import { signIn, signOut } from "tests/helpers/user";

const mockUserWithRussianWebLocale = factory( "RemoteUser", {
  locale: "ru"
} );

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

const toggleAdvancedMode = async ( ) => {
  const advancedSwitch = await screen.findByTestId( "advanced-interface-switch.switch" );
  fireEvent.press( advancedSwitch );
};

describe( "LanguageSettings", ( ) => {
  it( "uses locale preference of the local device", ( ) => {
    renderAppWithComponent( <Settings /> );
    const systemLocale = getInatLocaleFromSystemLocale( );
    expect( systemLocale ).toEqual( "en" );
    expect( i18next.language ).toEqual( systemLocale );
  } );

  describe( "when signed in as Russian language user", ( ) => {
    beforeEach( async ( ) => {
      await signIn( mockUserWithRussianWebLocale, { realm: global.mockRealms[__filename] } );
      jest.useFakeTimers( );
      inatjs.users.me.mockResolvedValue( makeResponse( [mockUserWithRussianWebLocale] ) );
      inatjs.translations.locales.mockResolvedValue( makeResponse( [{
        language_in_locale: "Русский",
        locale: "ru"
      }, {
        language_in_locale: "Svenska",
        locale: "sv"
      }] ) );
    } );

    afterEach( async ( ) => {
      await signOut( { realm: global.mockRealms[__filename] } );
    } );

    it( "uses locale preference from server", async ( ) => {
      renderAppWithComponent( <Settings /> );
      await toggleAdvancedMode( );
      const sciNameText = await screen.findByText(
        i18next.t( "Scientific-Name", { lang: "ru" } )
      );
      expect( sciNameText ).toBeVisible( );
    } );

    it( "allows change to Swedish and requests remote locale change", async ( ) => {
      renderAppWithComponent( <Settings /> );
      await toggleAdvancedMode( );
      const changeLocaleButton = await screen.findByText(
        i18next.t( "CHANGE-APP-LANGUAGE", { lang: "ru" } )
      );
      fireEvent.press( changeLocaleButton );
      const picker = await screen.findByTestId( "ReactNativePicker" );
      fireEvent( picker, "onValueChange", "sv" );
      expect( picker.props.selectedIndex ).toStrictEqual( 1 );
      const confirmText = await screen.findByText(
        i18next.t( "CONFIRM", { lang: "ru" } )
      );
      fireEvent.press( confirmText );
      const sciNameText = await screen.findByText(
        i18next.t( "Scientific-Name", { lang: "sv" } )
      );
      expect( sciNameText ).toBeVisible( );
      expect( inatjs.users.update ).toHaveBeenCalledWith( {
        id: mockUserWithRussianWebLocale.id,
        user: {
          locale: "sv"
        }
      }, {
        api_token: "test-json-web-token"
      } );
    } );

    it( "reverts to system locale on sign out", async ( ) => {
      renderAppWithComponent( <Settings /> );
      await signOut( { realm: global.mockRealms[__filename] } );
      expect( i18next.language ).toEqual( "en" );
    } );
  } );
} );
