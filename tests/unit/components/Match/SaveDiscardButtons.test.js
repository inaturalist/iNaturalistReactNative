import { fireEvent, screen } from "@testing-library/react-native";
import SaveDiscardButtons from "components/Match/SaveDiscardButtons";
import React from "react";
import { renderComponent } from "tests/helpers/render";

describe( "SaveDiscardButtons", () => {
  it( "calls handlePress with 'save'", () => {
    const mockHandlePress = jest.fn();

    renderComponent( <SaveDiscardButtons handlePress={mockHandlePress} /> );

    const saveButton = screen.getByText( "SAVE" );

    expect( saveButton ).toBeTruthy();

    fireEvent.press( saveButton );

    expect( mockHandlePress ).toHaveBeenCalledWith( "save" );
  } );

  it( "calls handlePress with 'discard", () => {
    const mockHandlePress = jest.fn();

    renderComponent( <SaveDiscardButtons handlePress={mockHandlePress} /> );

    const discardButton = screen.getByText( "DISCARD" );
    expect( discardButton ).toBeTruthy();
    fireEvent.press( discardButton );

    expect( mockHandlePress ).toHaveBeenCalledWith( "discard" );
    expect( mockHandlePress ).toHaveBeenCalledTimes( 1 );
  } );
} );
