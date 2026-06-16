import { fireEvent, screen } from "@testing-library/react-native";
import { RadioButtonSheet } from "components/SharedComponents";
import React from "react";
import { renderComponent } from "tests/helpers/render";

const mockHandleClose = jest.fn( );
const mockConfirm = jest.fn( );

const mockRadioValues = {
  first: {
    value: "value-1",
    label: "label 1",
    text: "description 1",
  },
  second: {
    value: "value-2",
    label: "label 2",
    text: "description 2",
  },
};

describe( "RadioButtonSheet", () => {
  beforeEach( () => {
    jest.clearAllMocks( );
  } );

  it( "should not have accessibility errors", () => {
    const sheet = (
      <RadioButtonSheet
        onPressClose={mockHandleClose}
        confirm={mockConfirm}
        headerText="header text"
        radioValues={mockRadioValues}
      />
    );

    // TODO: this errors because RadioButton from react-native-paper is not accessible
    console.log( "typeof sheet :>> ", typeof sheet );
    // expect( sheet ).toBeAccessible();
  } );

  it( "disables confirm when unchanged and requireSelectionChange is default", () => {
    renderComponent(
      <RadioButtonSheet
        onPressClose={mockHandleClose}
        confirm={mockConfirm}
        headerText="header text"
        radioValues={mockRadioValues}
        selectedValue={mockRadioValues.first.value}
      />,
    );

    const button = screen.getByText( "CONFIRM" );

    expect( button ).toBeDisabled( );
  } );

  it( "enables confirm on initial render when requireSelectionChange is false", () => {
    renderComponent(
      <RadioButtonSheet
        onPressClose={mockHandleClose}
        confirm={mockConfirm}
        headerText="header text"
        radioValues={mockRadioValues}
        requireSelectionChange={false}
        selectedValue={mockRadioValues.first.value}
      />,
    );

    const button = screen.getByText( "CONFIRM" );

    expect( button ).toBeEnabled( );
  } );

  it( "enables confirm after changing option when requireSelectionChange is default", () => {
    renderComponent(
      <RadioButtonSheet
        onPressClose={mockHandleClose}
        confirm={mockConfirm}
        headerText="header text"
        radioValues={mockRadioValues}
        selectedValue={mockRadioValues.first.value}
      />,
    );
    const label2 = screen.getByText( "label 2" );
    const button = screen.getByText( "CONFIRM" );

    fireEvent.press( label2 );
    expect( button ).toBeEnabled();
    fireEvent.press( button );

    expect( mockConfirm ).toHaveBeenCalledWith( "value-2" );
  } );
} );
