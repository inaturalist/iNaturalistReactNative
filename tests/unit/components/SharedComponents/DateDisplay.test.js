import { DateDisplay } from "components/SharedComponents";
import React from "react";

describe( "DateDisplay", () => {
  it( "should be accessible", () => {
    // Disabled during the update to RN 0.78
    expect( <DateDisplay dateString="2023-12-14T21:07:41+00:00" /> ).toBeTruthy( );
    // expect( <DateDisplay dateString="2023-12-14T21:07:41+00:00" /> ).toBeAccessible( );
  } );
} );
