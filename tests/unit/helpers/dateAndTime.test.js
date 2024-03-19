import factory from "factoria";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import { formatApiDatetime } from "sharedHelpers/dateAndTime";

const remoteObservation = factory( "RemoteObservation", {
  created_at: "2015-02-12T20:41:10-08:00"
} );
const remoteIdentification = factory( "RemoteIdentification", {
  created_at: "2015-02-13T05:12:05+00:00"
} );
const remoteComment = factory( "RemoteComment", {
  created_at: "2015-02-13T05:15:38+00:00",
  updated_at: "2015-02-12T20:41:10-08:00"
} );

describe( "formatApiDatetime", ( ) => {
  describe( "in default locale", ( ) => {
    it( "should return missing date string if no date is present", async ( ) => {
      expect( formatApiDatetime( null, i18next.t ) ).toEqual( "Missing Date" );
    } );

    it( "should return missing date string if date is empty", ( ) => {
      const date = "";
      expect( formatApiDatetime( date, i18next.t ) ).toEqual( "Missing Date" );
    } );

    it( "should return a localized date when a date string is passed in", ( ) => {
      const date = "2022-11-02";
      expect( formatApiDatetime( date, i18next.t ) ).toEqual( "11/2/22" );
    } );

    it( "should return a localized datetime when a datetime string is passed in", ( ) => {
      const date = "2022-11-02T18:43:00+00:00";
      expect( formatApiDatetime( date, i18next.t ) ).toEqual( "11/2/22 6:43 PM" );
    } );

    it( "should return a localized datetime for a remote observation created_at date", ( ) => {
      expect(
        formatApiDatetime( remoteObservation.created_at, i18next.t )
      ).toEqual( "2/13/15 4:41 AM" );
    } );

    it( "should return a localized datetime for a remote identification created_at date", ( ) => {
      expect(
        formatApiDatetime( remoteIdentification.created_at, i18next.t )
      ).toEqual( "2/13/15 5:12 AM" );
    } );

    it( "should return a localized datetime for a remote comment created_at date", ( ) => {
      expect(
        formatApiDatetime( remoteComment.created_at, i18next.t )
      ).toEqual( "2/13/15 5:15 AM" );
    } );

    it( "should return the date in the local time zone by default", () => {
      expect( process.env.TZ ).toEqual( "UTC" );
      expect(
        formatApiDatetime( "2023-01-02T08:00:00+01:00", i18next.t )
      ).toEqual( "1/2/23 7:00 AM" );
    } );

    it.todo(
      "should return a localized datetime for a local observation created_at date"
    );
    it.todo( "should optionally show the date in the original time zone" );
  } );

  describe( "in es-MX", ( ) => {
    beforeAll( async ( ) => {
      await initI18next( { lng: "es-MX" } );
    } );

    it( "should return a localized date when a date string is passed in", ( ) => {
      const date = "2022-11-02";
      expect( formatApiDatetime( date, i18next.t ) ).toEqual( "2/11/22" );
    } );
  } );
} );
