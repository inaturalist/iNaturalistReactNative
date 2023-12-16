import { screen } from "@testing-library/react-native";
import Search from "components/Search/Search";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "Search", () => {
  test( "should not have accessibility errors", async () => {
    renderComponent( <Search /> );
    const search = await screen.findByTestId( "Search" );
    expect( search ).toBeAccessible( );

    screen.unmount( );
  } );
} );
