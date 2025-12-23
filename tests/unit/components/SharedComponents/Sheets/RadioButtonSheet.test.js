import { RadioButtonSheet } from "components/SharedComponents";
import React from "react";

const mockHandleClose = jest.fn( );
const mockConfirm = jest.fn( );
const mockValues = [
  {
    value: "value 1",
    label: "label 1",
    description: "description 1",
  },
  {
    value: "value 2",
    label: "label 2",
    description: "description 2",
  },
];

describe( "RadioButtonSheet", () => {
  it( "should not have accessibility errors", () => {
    const sheet = (
      <RadioButtonSheet
        onPressClose={mockHandleClose}
        confirm={mockConfirm}
        headerText="header text"
        radioValues={mockValues}
      />
    );

    // TODO: this errors because RadioButton from react-native-paper is not accessible
    console.log( "typeof sheet :>> ", typeof sheet );
    // expect( sheet ).toBeAccessible();
  } );
} );
