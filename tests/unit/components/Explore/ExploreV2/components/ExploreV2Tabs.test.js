import { screen } from "@testing-library/react-native";
import ExploreV2Tabs from "components/Explore/ExploreV2/components/ExploreV2Tabs";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "ExploreV2Tabs", () => {
  it( "renders both the observations and species tabs", () => {
    renderComponent( <ExploreV2Tabs /> );

    expect( screen.getByTestId( "ExploreV2Tabs.observations" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Tabs.species" ) ).toBeTruthy();
  } );

  it( "marks the observations tab as the active tab", () => {
    renderComponent( <ExploreV2Tabs /> );

    expect(
      screen.getByTestId( "ExploreV2Tabs.observations" ).props.accessibilityState.selected,
    ).toBe( true );
    expect(
      screen.getByTestId( "ExploreV2Tabs.species" ).props.accessibilityState.selected,
    ).toBe( false );
  } );

  it( "renders the provided observation and species counts", () => {
    renderComponent( <ExploreV2Tabs observationsCount={42} speciesCount={7} /> );

    expect( screen.getByText( "42" ) ).toBeTruthy();
    expect( screen.getByText( "7" ) ).toBeTruthy();
  } );

  it( "renders a placeholder when counts are not provided", () => {
    renderComponent( <ExploreV2Tabs /> );

    expect( screen.getAllByText( "--" ) ).toHaveLength( 2 );
  } );
} );
