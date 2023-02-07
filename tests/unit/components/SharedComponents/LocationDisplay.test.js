import { screen } from "@testing-library/react-native";
import { LocationDisplay } from "components/SharedComponents";
import React from "react";

import { renderComponent } from "../../../helpers/render";

describe( "DateDisplay", () => {
  it( "should be accessible", () => {
    expect( <LocationDisplay latitude={30.181830} longitude={-85.760449} /> ).toBeAccessible( );
  } );

  it( "should format datetime correctly from date string", () => {
    renderComponent( <LocationDisplay latitude={30.181830} longitude={-85.760449} /> );
    expect( screen.getByText( "San Francisco, CA" ) ).toBeTruthy( );
  } );
} );
