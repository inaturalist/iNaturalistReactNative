import initI18next, { I18NEXT_CONFIG } from "i18n/initI18next";
import i18next from "i18next";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";

describe( "Date formatting for English locales", ( ) => {
  describe( "US English (en)", ( ) => {
    beforeAll( async ( ) => {
      await initI18next( { lng: "en" } );
    } );

    it( "should use M/d/yy format for short dates", ( ) => {
      const date = "2022-11-02";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "11/2/22" );
    } );

    it( "should use M/d/yy h:mm a format for short datetimes", ( ) => {
      const date = "2022-11-02T18:43:00+00:00";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "11/2/22 6:43 PM UTC" );
    } );
  } );

  describe( "British English (en-GB)", ( ) => {
    beforeAll( async ( ) => {
      await initI18next( { lng: "en-GB" } );
    } );

    it( "should use d/M/yy format for short dates", ( ) => {
      const date = "2022-11-02";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "2/11/22" );
    } );

    it( "should use d/M/yy h:mm a format for short datetimes", ( ) => {
      const date = "2022-11-02T18:43:00+00:00";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "2/11/22 6:43 PM UTC" );
    } );
  } );

  describe( "New Zealand English (en-NZ)", ( ) => {
    beforeAll( async ( ) => {
      await initI18next( { lng: "en-NZ" } );
    } );

    it( "should use d/M/yy format for short dates", ( ) => {
      const date = "2022-11-02";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "2/11/22" );
    } );

    it( "should use d/M/yy h:mm a format for short datetimes", ( ) => {
      const date = "2022-11-02T18:43:00+00:00";
      expect( formatApiDatetime( date, i18next ) ).toEqual( "2/11/22 6:43 PM UTC" );
    } );
  } );
} );

describe( "i18next fallback configuration", ( ) => {
  const { fallbackLng } = I18NEXT_CONFIG;

  describe( "Commonwealth English variants should use en-GB", ( ) => {
    it( "should fall back to en-GB for en-AU (Australia)", ( ) => {
      expect( fallbackLng( "en-AU" ) ).toEqual( ["en-GB", "en"] );
    } );

    it( "should fall back to en-GB for en-ZA (South Africa)", ( ) => {
      expect( fallbackLng( "en-ZA" ) ).toEqual( ["en-GB", "en"] );
    } );

    it( "should fall back to en-GB for en-IN (India)", ( ) => {
      expect( fallbackLng( "en-IN" ) ).toEqual( ["en-GB", "en"] );
    } );

    it( "should fall back to en-GB for en-IE (Ireland)", ( ) => {
      expect( fallbackLng( "en-IE" ) ).toEqual( ["en-GB", "en"] );
    } );

    it( "should fall back to en-GB for en-SG (Singapore)", ( ) => {
      expect( fallbackLng( "en-SG" ) ).toEqual( ["en-GB", "en"] );
    } );

    it( "should fall back to en-GB for en-MY (Malaysia)", ( ) => {
      expect( fallbackLng( "en-MY" ) ).toEqual( ["en-GB", "en"] );
    } );
  } );

  describe( "Other English variants should use en (US)", ( ) => {
    it( "should fall back directly to en for en-CA (Canada)", ( ) => {
      expect( fallbackLng( "en-CA" ) ).toEqual( ["en"] );
    } );

    it( "should fall back directly to en for en-PH (Philippines)", ( ) => {
      expect( fallbackLng( "en-PH" ) ).toEqual( ["en"] );
    } );

    it( "should fall back directly to en for en-US", ( ) => {
      expect( fallbackLng( "en-US" ) ).toEqual( ["en"] );
    } );

    it( "should fall back directly to en for any unlisted en-* variant", ( ) => {
      expect( fallbackLng( "en-XX" ) ).toEqual( ["en"] );
    } );
  } );

  describe( "Locales with their own files should not use en-GB", ( ) => {
    it( "should NOT fall back to en-GB for en-NZ (has its own locale)", ( ) => {
      expect( fallbackLng( "en-NZ" ) ).toEqual( ["en"] );
    } );

    it( "should NOT fall back to en-GB for en-GB itself", ( ) => {
      expect( fallbackLng( "en-GB" ) ).toEqual( ["en"] );
    } );

    it( "should fall back to en for base en locale", ( ) => {
      expect( fallbackLng( "en" ) ).toEqual( ["en"] );
    } );
  } );

  describe( "Non-English regional variants", ( ) => {
    it( "should fall back to es for es-AR", ( ) => {
      expect( fallbackLng( "es-AR" ) ).toEqual( ["es", "en"] );
    } );

    it( "should fall back to fr for fr-CA", ( ) => {
      expect( fallbackLng( "fr-CA" ) ).toEqual( ["fr", "en"] );
    } );

    it( "should fall back to pt for pt-BR", ( ) => {
      expect( fallbackLng( "pt-BR" ) ).toEqual( ["pt", "en"] );
    } );

    it( "should fall back to en for non-English locale without regional variant", ( ) => {
      expect( fallbackLng( "de" ) ).toEqual( ["en"] );
    } );

    it( "should fall back to en when no code is provided", ( ) => {
      expect( fallbackLng( null ) ).toEqual( ["en"] );
    } );
  } );
} );
