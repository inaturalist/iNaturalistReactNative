import { screen, userEvent } from "@testing-library/react-native";
import ExploreV2Tabs from "components/Explore/ExploreV2/components/ExploreV2Tabs";
import { ExploreV2Provider } from "providers/ExploreV2Context";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup( );

const renderTabs = props => renderComponent(
  <ExploreV2Provider>
    <ExploreV2Tabs {...props} />
  </ExploreV2Provider>,
);

describe( "ExploreV2Tabs", () => {
  it( "renders both the observations and species tabs", () => {
    renderTabs();

    expect( screen.getByTestId( "ExploreV2Tabs.observations" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreV2Tabs.species" ) ).toBeTruthy();
  } );

  it( "marks the observations tab as the active tab by default", () => {
    renderTabs();

    expect(
      screen.getByTestId( "ExploreV2Tabs.observations" ).props.accessibilityState.selected,
    ).toBe( true );
    expect(
      screen.getByTestId( "ExploreV2Tabs.species" ).props.accessibilityState.selected,
    ).toBe( false );
  } );

  it( "switches the active tab when the species tab is pressed", async () => {
    renderTabs();

    await actor.press( screen.getByTestId( "ExploreV2Tabs.species" ) );

    expect(
      screen.getByTestId( "ExploreV2Tabs.species" ).props.accessibilityState.selected,
    ).toBe( true );
    expect(
      screen.getByTestId( "ExploreV2Tabs.observations" ).props.accessibilityState.selected,
    ).toBe( false );
  } );

  it( "renders the provided observation and species counts", () => {
    renderTabs( { observationsCount: 42, speciesCount: 7 } );

    expect( screen.getByText( "42" ) ).toBeTruthy();
    expect( screen.getByText( "7" ) ).toBeTruthy();
  } );

  it( "renders a placeholder when counts are not provided", () => {
    renderTabs();

    expect( screen.getAllByText( "--" ) ).toHaveLength( 2 );
  } );

  it( "renders a placeholder when counts are null", () => {
    renderTabs( { observationsCount: null, speciesCount: null } );

    expect( screen.getAllByText( "--" ) ).toHaveLength( 2 );
  } );
} );
