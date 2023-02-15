import { DateDisplay } from "components/SharedComponents";
import initI18next from "i18n/initI18next";
import React from "react";

describe( "DateDisplay", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  it( "should be accessible", () => {
    expect( <DateDisplay dateString="2023-12-14T21:07:41+00:00" /> ).toBeAccessible( );
  } );
} );
