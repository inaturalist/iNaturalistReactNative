import {
  formatApiDatetime
} from "sharedHelpers/dateAndTime";

describe( "formatApiDatetime", ( ) => {
  it( "should return missing date string if no date is present", ( ) => {
    const date = null;
    expect( formatApiDatetime( date ) ).toEqual( "Missing Date" );
  } );

  it( "should return missing date string if date is empty", ( ) => {
    const date = "";
    expect( formatApiDatetime( date ) ).toEqual( "Missing Date" );
  } );

  it( "should return a localized date when a date string is passed in", ( ) => {
    const date = "2022-11-02";
    expect( formatApiDatetime( date ) ).toEqual( "11/2/22" );
  } );

  it( "should return a localized datetime when a datetime string is passed in", ( ) => {
    const date = "2022-11-02T18:43:00-08:00";
    expect( formatApiDatetime( date ) ).toEqual( "11/2/22 6:43 PM" );
  } );
} );
