import { screen } from "@testing-library/react-native";
import MatchScreenTopContent from "components/Match/MatchScreenTopContent";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "MatchScreenTopContent", () => {
  const topSuggestion = {
    combined_score: 95,
    taxon: factory( "LocalTaxon", {
      name: "Silphium perfoliatum",
      preferred_common_name: "Cup Plant",
      rank_level: 10,
    } ),
  };

  it( "displays MatchHeader when topSuggestion is provided", () => {
    renderComponent(
      <MatchScreenTopContent
        suggestionsLoading={false}
        topSuggestion={topSuggestion}
        hasNoSuggestions={false}
        hasOnlyOtherSuggestions={false}
      />,
    );

    expect( screen.getByText( "Cup Plant" ) ).toBeVisible();
  } );

  it( "shows message for hasNoSuggestions", () => {
    renderComponent(
      <MatchScreenTopContent
        suggestionsLoading={false}
        hasNoSuggestions
        hasOnlyOtherSuggestions={false}
      />,
    );

    expect( screen.getByText(
      "The AI is not confident. Upload to ask the community.",
    ) ).toBeVisible();
  } );

  it( "shows message for hasOnlyOtherSuggestions", () => {
    renderComponent(
      <MatchScreenTopContent
        suggestionsLoading={false}
        hasNoSuggestions={false}
        hasOnlyOtherSuggestions
      />,
    );

    expect( screen.getByText(
      "The AI is not confident. It may be one of the IDs below.",
    ) ).toBeVisible();
  } );

  it( "renders loading state over other content", () => {
    const topSuggestion = {
      combined_score: 90,
      taxon: factory( "LocalTaxon", { rank_level: 10 } ),
    };

    renderComponent(
      <MatchScreenTopContent
        suggestionsLoading
        topSuggestion={topSuggestion}
        hasNoSuggestions
        hasOnlyOtherSuggestions
      />,
    );

    const activityIndicator = screen.getByRole( "progressbar" );
    expect( activityIndicator ).toBeVisible();

    expect( screen.queryByText( /Cup Plant/i ) ).toBeFalsy();
  } );
} );
