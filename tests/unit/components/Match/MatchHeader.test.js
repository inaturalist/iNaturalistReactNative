import { screen } from "@testing-library/react-native";
import MatchHeader from "components/Match/MatchHeader";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "MatchHeader", () => {
  it( "does not render content when topSuggestion is not provided", () => {
    renderComponent( <MatchHeader /> );

    expect( screen.queryByText( /observed/i ) ).toBeFalsy();
    expect( screen.queryByText( /Confidence/i ) ).toBeFalsy();
  } );

  it( "displays high confidence message for species", () => {
    const topSuggestion = {
      combined_score: 95,
      taxon: factory( "LocalTaxon", { rank_level: 10 } )
    };

    renderComponent( <MatchHeader topSuggestion={topSuggestion} /> );

    expect( screen.getByText( "You observed this species" ) ).toBeTruthy();
  } );

  it( "displays high confidence message for taxa above species", () => {
    const topSuggestion = {
      combined_score: 95,
      taxon: factory( "LocalTaxon", { rank_level: 20 } )
    };

    renderComponent( <MatchHeader topSuggestion={topSuggestion} /> );

    expect( screen.getByText( "You observed a species in this group" ) ).toBeTruthy();
    expect( screen.getByText( "95%" ) ).toBeTruthy();
    expect( screen.getByText( "Confidence" ) ).toBeTruthy();
  } );

  it( "displays likely confidence message for species", () => {
    const topSuggestion = {
      combined_score: 75,
      taxon: factory( "LocalTaxon", { rank_level: 10 } )
    };

    renderComponent( <MatchHeader topSuggestion={topSuggestion} /> );

    expect( screen.getByText( "You likely observed this species" ) ).toBeTruthy();
  } );

  it( "displays may have observed message", () => {
    const topSuggestion = {
      combined_score: 30,
      taxon: factory( "LocalTaxon", { rank_level: 10 } )
    };

    renderComponent( <MatchHeader topSuggestion={topSuggestion} /> );

    expect( screen.getByText( "You may have observed this species" ) ).toBeTruthy();
  } );

  it( "hides observation status when hideObservationStatus is true", () => {
    const topSuggestion = {
      combined_score: 87.5,
      taxon: factory( "LocalTaxon", { rank_level: 10 } )
    };

    renderComponent( <MatchHeader topSuggestion={topSuggestion} hideObservationStatus /> );

    expect( screen.queryByText( "You observed this species" ) ).toBeFalsy();
    expect( screen.queryByText( "87.5%" ) ).toBeFalsy();
    expect( screen.queryByText( "Confidence" ) ).toBeFalsy();
  } );
} );
