import { screen } from "@testing-library/react-native";
import AdditionalSuggestionsScroll
  from "components/Match/AdditionalSuggestions/AdditionalSuggestionsScroll";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "AdditionalSuggestionsScroll", () => {
  it( "returns null when not loading and otherSuggestions is empty", () => {
    renderComponent(
      <AdditionalSuggestionsScroll
        otherSuggestions={[]}
        suggestionsLoading={false}
        onSuggestionChosen={jest.fn()}
      />,
    );

    expect( screen.queryByText( "It might also be" ) ).toBeFalsy();
    expect( screen.queryByText( "It might be one of these" ) ).toBeFalsy();
  } );

  it( "shows ActivityIndicator when suggestionsLoading is true", () => {
    renderComponent(
      <AdditionalSuggestionsScroll
        otherSuggestions={[]}
        suggestionsLoading
        onSuggestionChosen={jest.fn()}
      />,
    );
    expect( screen.getByRole( "progressbar" ) ).toBeVisible();
  } );

  it( "renders heading when noTopSuggestion is true", () => {
    const suggestions = [
      {
        taxon: factory( "RemoteTaxon" ),
        combined_score: 85,
      },
    ];

    renderComponent(
      <AdditionalSuggestionsScroll
        noTopSuggestion
        otherSuggestions={suggestions}
        suggestionsLoading={false}
        onSuggestionChosen={jest.fn()}
      />,
    );

    expect( screen.getByText( "It might be one of these" ) ).toBeVisible();
  } );
} );
