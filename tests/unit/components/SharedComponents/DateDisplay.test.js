import { screen } from "@testing-library/react-native";
import { DateDisplay } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

import { renderComponent } from "../../../helpers/render";

describe( "DateDisplay", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should be accessible", () => {
    expect( <DateDisplay dateTime="2023-12-14T21:07:41+00:00" /> ).toBeAccessible( );
  } );

  it( "should format datetime correctly from date string", () => {
    renderComponent( <DateDisplay dateTime="2023-12-14T21:37:00+00:00" /> );
    expect( screen.getByText( "12/14/23 9:37 PM" ) ).toBeTruthy( );
  } );

  it( "should show the date in the local time zone by default", () => {
    renderComponent( <DateDisplay dateTime="2023-01-02T08:00:00+01:00" /> );
    expect( process.env.TZ ).toEqual( "UTC" );
    expect( screen.getByText( "1/2/23 7:00 AM" ) ).toBeTruthy( );
  } );

  it.todo( "should optionally show the date in the original time zone" );

  it( "should display placeholder if no dateTime", () => {
    renderComponent( <DateDisplay dateTime={undefined} /> );
    expect( screen.getByText( "Missing Date" ) ).toBeTruthy( );
  } );
} );
