import { DateDisplay } from "components/SharedComponents";
import React from "react";

describe( "DateDisplay", () => {


  it( "should be accessible", () => {
    expect( <DateDisplay dateString="2023-12-14T21:07:41+00:00" /> ).toBeAccessible( );
  } );
} );
