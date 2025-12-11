import { fireEvent, screen } from "@testing-library/react-native";
import SuggestionsResult from "components/Match/AdditionalSuggestions/SuggestionsResult";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "SuggestionsResult", () => {
  it( "renders and displays taxon name, image, and confidence", () => {
    const apiTaxon = factory( "RemoteTaxon", {
      id: 745,
      name: "Silphium perfoliatum",
      preferred_common_name: "Cup Plant",
      rank: "species",
      rank_level: 10,
      representative_photo: {
        url: "https://example.com/cupplant.jpg"
      }
    } );

    renderComponent(
      <SuggestionsResult
        taxon={apiTaxon}
        confidence={87}
        forcedHeight={0}
      />
    );

    expect( screen.getByText( "Cup Plant" ) ).toBeTruthy();
    expect( screen.getByText( "Silphium perfoliatum" ) ).toBeTruthy();
    expect( screen.getByText( "87% confidence" ) ).toBeTruthy();
    expect( screen.getByTestId( "SuggestionsResult.745.photo" ) ).toBeTruthy();
  } );

  it( "handles invalidated Realm taxon and returns null", () => {
    const invalidatedTaxon = factory( "LocalTaxon", {
      id: 746,
      name: "Silphium laciniatum"
    } );

    invalidatedTaxon.isValid = jest.fn().mockReturnValue( false );

    renderComponent(
      <SuggestionsResult
        taxon={invalidatedTaxon}
        confidence={75}
        forcedHeight={0}
      />
    );

    expect( screen.queryByText( "Silphium laciniatum" ) ).toBeFalsy();
  } );

  it( "calls handlePress when pressed", () => {
    const mockHandlePress = jest.fn();
    const taxon = factory( "RemoteTaxon", { id: 747 } );

    renderComponent(
      <SuggestionsResult
        taxon={taxon}
        confidence={95}
        handlePress={mockHandlePress}
        forcedHeight={0}
      />
    );

    const button = screen.getByTestId( "SuggestionsResult.747" );
    fireEvent.press( button );

    expect( mockHandlePress ).toHaveBeenCalled();
  } );

  it( "calls updateMaxHeight with measured height on layout", () => {
    const mockUpdateMaxHeight = jest.fn();
    const taxon = factory( "RemoteTaxon", { id: 748 } );

    renderComponent(
      <SuggestionsResult
        taxon={taxon}
        confidence={60}
        updateMaxHeight={mockUpdateMaxHeight}
        forcedHeight={0}
      />
    );

    const layoutView = screen.getByTestId( "SuggestionsResult.748" ).parent;
    fireEvent( layoutView, "layout", {
      nativeEvent: {
        layout: {
          height: 120
        }
      }
    } );

    expect( mockUpdateMaxHeight ).toHaveBeenCalledWith( 120 );
  } );
} );
