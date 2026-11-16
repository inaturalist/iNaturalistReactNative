import { screen, userEvent } from "@testing-library/react-native";
import ExploreTabs from "components/Explore/components/ExploreTabs";
import { ExploreProvider, initialExploreState } from "providers/ExploreContext";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const actor = userEvent.setup( );

const renderTabs = props => renderComponent(
  <ExploreProvider initialState={initialExploreState}>
    <ExploreTabs {...props} />
  </ExploreProvider>,
);

const setAdvancedSearchMode = advancedSearchMode => useStore
  .getState( ).exploreAdvancedSearch.setAdvancedSearchMode( advancedSearchMode );

describe( "ExploreTabs", () => {
  beforeEach( () => {
    setAdvancedSearchMode( false );
  } );

  it( "renders both the observations and species tabs", () => {
    renderTabs();

    expect( screen.getByTestId( "ExploreTabs.observations" ) ).toBeTruthy();
    expect( screen.getByTestId( "ExploreTabs.species" ) ).toBeTruthy();
  } );

  it( "marks the observations tab as the active tab by default", () => {
    renderTabs();

    expect(
      screen.getByTestId( "ExploreTabs.observations" ).props.accessibilityState.selected,
    ).toBe( true );
    expect(
      screen.getByTestId( "ExploreTabs.species" ).props.accessibilityState.selected,
    ).toBe( false );
  } );

  it( "switches the active tab when the species tab is pressed", async () => {
    renderTabs();

    await actor.press( screen.getByTestId( "ExploreTabs.species" ) );

    expect(
      screen.getByTestId( "ExploreTabs.species" ).props.accessibilityState.selected,
    ).toBe( true );
    expect(
      screen.getByTestId( "ExploreTabs.observations" ).props.accessibilityState.selected,
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

  it( "does not render the observers and identifiers tabs in default search mode", () => {
    renderTabs();

    expect( screen.queryByTestId( "ExploreTabs.observers" ) ).toBeNull();
    expect( screen.queryByTestId( "ExploreTabs.identifiers" ) ).toBeNull();
  } );

  describe( "in advanced search mode", () => {
    beforeEach( () => {
      setAdvancedSearchMode( true );
    } );

    it( "renders all four tabs", () => {
      renderTabs();

      expect( screen.getByTestId( "ExploreTabs.observations" ) ).toBeTruthy();
      expect( screen.getByTestId( "ExploreTabs.species" ) ).toBeTruthy();
      expect( screen.getByTestId( "ExploreTabs.observers" ) ).toBeTruthy();
      expect( screen.getByTestId( "ExploreTabs.identifiers" ) ).toBeTruthy();
    } );

    it( "renders the provided observer and identifier counts", () => {
      renderTabs( { observersCount: 12, identifiersCount: 3 } );

      expect( screen.getByText( "12" ) ).toBeTruthy();
      expect( screen.getByText( "3" ) ).toBeTruthy();
    } );

    it.each( ["observers", "identifiers"] )(
      "switches the active tab when the %s tab is pressed",
      async tab => {
        renderTabs();

        await actor.press( screen.getByTestId( `ExploreTabs.${tab}` ) );

        expect(
          screen.getByTestId( `ExploreTabs.${tab}` ).props.accessibilityState.selected,
        ).toBe( true );
        expect(
          screen.getByTestId( "ExploreTabs.observations" ).props.accessibilityState.selected,
        ).toBe( false );
      },
    );
  } );
} );
