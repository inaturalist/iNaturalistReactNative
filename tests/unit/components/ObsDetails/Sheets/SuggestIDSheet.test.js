import { fireEvent, screen } from "@testing-library/react-native";
import SuggestIDSheet from "components/ObsDetailsSharedComponents/Sheets/SuggestIDSheet";
import { t } from "i18next";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockTaxon = factory( "RemoteTaxon", {
  id: 745,
  name: "Silphium perfoliatum",
  preferred_common_name: "Cup Plant",
  rank: "species",
  rank_level: 10,
} );

const mockOnSuggestId = jest.fn();
const mockEditIdentBody = jest.fn();

describe( "SuggestIDSheet", () => {
  beforeEach( () => {
    jest.clearAllMocks();
  } );

  it( "renders header and suggest button", async () => {
    renderComponent(
      <SuggestIDSheet
        identification={{ taxon: mockTaxon }}
        onSuggestId={mockOnSuggestId}
        editIdentBody={mockEditIdentBody}
      />,
    );

    expect( await screen.findByTestId( "bottom-sheet-header" ) ).toBeVisible();
    expect(
      screen.getByText( t( "Would-you-like-to-suggest-the-following-identification" ) ),
    ).toBeVisible();

    const suggestIdButton = await screen.findByTestId( "SuggestIDSheet.cvSuggestionsButton" );
    expect( suggestIdButton ).toBeVisible();

    fireEvent.press( suggestIdButton );
    expect( mockOnSuggestId ).toHaveBeenCalledTimes( 1 );
  } );

  it( "shows id comment with edit button if comment is already present", async () => {
    const identificationWithBody = {
      taxon: mockTaxon,
      body: "This is my identification comment",
    };

    renderComponent(
      <SuggestIDSheet
        identification={identificationWithBody}
        onSuggestId={mockOnSuggestId}
        editIdentBody={mockEditIdentBody}
      />,
    );

    expect( await screen.findByText( "This is my identification comment" ) ).toBeVisible();

    const editCommentButton = await screen.findByTestId( "SuggestID.EditCommentButton" );
    expect( editCommentButton ).toBeVisible();
    expect( screen.getByText( t( "EDIT-COMMENT" ) ) ).toBeVisible();

    fireEvent.press( editCommentButton );
    expect( mockEditIdentBody ).toHaveBeenCalledTimes( 1 );
  } );

  it( "displays an ADD-COMMENT button for no existing comment", async () => {
    renderComponent(
      <SuggestIDSheet
        identification={{ taxon: mockTaxon }}
        onSuggestId={mockOnSuggestId}
        editIdentBody={mockEditIdentBody}
      />,
    );

    const addCommentButton = await screen.findByTestId( "SuggestID.commentButton" );
    expect( addCommentButton ).toBeVisible();
    expect( screen.getByText( t( "ADD-COMMENT" ) ) ).toBeVisible();

    fireEvent.press( addCommentButton );
    expect( mockEditIdentBody ).toHaveBeenCalledTimes( 1 );
  } );
} );
