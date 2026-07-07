import { screen, userEvent } from "@testing-library/react-native";
import DateFieldInput from "components/AddToProjects/FieldInputs/DateFieldInput";
import useObservationFieldValue from "components/AddToProjects/hooks/useObservationFieldValue";
import React from "react";
import { Pressable as MockPressable } from "react-native";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/AddToProjects/hooks/useObservationFieldValue" );

jest.mock( "components/SharedComponents/DateTimePicker", () => function (
  { isDateTimePickerVisible, onDatePicked },
) {
  return isDateTimePickerVisible
    ? (
      <MockPressable
        accessibilityRole="button"
        testID="mock-date-picker-confirm"
        onPress={() => onDatePicked( new Date( "2021-09-17T20:00:00" ) )}
      />
    )
    : null;
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

describe( "DateFieldInput", ( ) => {
  it( "reads the OFV value from the hook for the given obsFieldId", ( ) => {
    const mockOF = factory( "LocalObservationField", { datatype: "date" } );
    renderComponent( <DateFieldInput obsField={mockOF} /> );

    expect( useObservationFieldValue ).toHaveBeenCalledWith( mockOF.id );
  } );

  it( "calls setValue with a B6 date string for date fields", async ( ) => {
    const mockOF = factory( "LocalObservationField", { datatype: "date" } );
    renderComponent( <DateFieldInput obsField={mockOF} /> );

    expect( screen.getByText( "Choose a date" ) ).toBeVisible( );
    await actor.press( screen.getByText( "Choose a date" ) );
    await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

    expect( mockSetValue ).toHaveBeenCalledWith( "2021-09-17" );
  } );

  it( "calls setValue with a B6 time string for time fields", async ( ) => {
    const mockOF = factory( "LocalObservationField", { datatype: "time" } );
    renderComponent( <DateFieldInput obsField={mockOF} /> );

    await actor.press( screen.getByText( "Choose a time" ) );
    await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

    expect( mockSetValue ).toHaveBeenCalledWith( "20:00" );
  } );

  it( "calls setValue with a B6 datetime string for datetime fields", async ( ) => {
    const mockOF = factory( "LocalObservationField", { datatype: "datetime" } );
    renderComponent( <DateFieldInput obsField={mockOF} /> );

    await actor.press( screen.getByText( "Choose a date & time" ) );
    await actor.press( screen.getByTestId( "mock-date-picker-confirm" ) );

    expect( mockSetValue ).toHaveBeenCalledWith( "2021-09-17 20:00" );
  } );
} );
