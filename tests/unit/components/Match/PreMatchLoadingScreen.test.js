import { screen } from "@testing-library/react-native";
import PreMatchLoadingScreen from "components/Match/PreMatchLoadingScreen";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "PreMatchLoadingScreen", () => {
  it( "renders nothing when isLoading is false", () => {
    renderComponent( <PreMatchLoadingScreen isLoading={false} /> );

    expect( screen.queryByText( "Analyzing for the best identification..." ) ).toBeFalsy();
  } );

  it( "shows loading screen when isLoading is true", () => {
    renderComponent( <PreMatchLoadingScreen isLoading /> );

    expect( screen.getByText( "Analyzing for the best identification..." ) ).toBeVisible();
    // Find activity indicator
    expect( screen.getByRole( "progressbar" ) ).toBeVisible();
  } );
} );
