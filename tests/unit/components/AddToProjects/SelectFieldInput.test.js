import { screen, userEvent } from "@testing-library/react-native";
import SelectFieldInput from "components/AddToProjects/FieldInputs/SelectFieldInput";
import useObservationFieldValue from "components/AddToProjects/hooks/useObservationFieldValue";
import React from "react";
import { Pressable as MockPressable } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/AddToProjects/hooks/useObservationFieldValue" );

jest.mock( "components/SharedComponents/Sheets/PickerSheet", () => function ( { confirm } ) {
  return (
    <MockPressable
      accessibilityRole="button"
      testID="mock-picker-confirm"
      onPress={() => confirm( "Red" )}
    />
  );
} );

const actor = userEvent.setup( );
const mockSetValue = jest.fn( );

beforeEach( ( ) => {
  mockSetValue.mockClear( );
  useObservationFieldValue.mockImplementation( () => ( {
    value: "",
    setValue: mockSetValue,
  } ) );
} );

const mockOF = factory( "LocalObservationField" );

describe( "SelectFieldInput", ( ) => {
  it( "reads the OFV value from the hook for the given obsFieldId", ( ) => {
    renderComponent( <SelectFieldInput obsField={mockOF} /> );

    expect( useObservationFieldValue ).toHaveBeenCalledWith( mockOF.id );
  } );

  it( "shows placeholder when no value is selected", ( ) => {
    renderComponent( <SelectFieldInput obsField={mockOF} /> );

    expect( screen.getByText( "Select a response" ) ).toBeVisible( );
  } );

  it( "displays the selected value from the hook", ( ) => {
    useObservationFieldValue.mockImplementation( () => ( {
      value: "Red",
      setValue: mockSetValue,
    } ) );

    renderComponent( <SelectFieldInput obsField={mockOF} /> );

    expect( screen.getByText( "Red" ) ).toBeVisible( );
  } );

  it( "calls setValue with the confirmed selection", async ( ) => {
    renderComponent( <SelectFieldInput obsField={mockOF} /> );

    await actor.press( screen.getByText( "Select a response" ) );
    await actor.press( screen.getByTestId( "mock-picker-confirm" ) );

    expect( mockSetValue ).toHaveBeenCalledWith( "Red" );
  } );
} );
