import { screen, userEvent } from "@testing-library/react-native";
import NumericFieldInput from "components/AddToProjects/FieldInputs/NumericFieldInput";
import useObservationFieldValue from "components/AddToProjects/hooks/useObservationFieldValue";
import React from "react";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/AddToProjects/hooks/useObservationFieldValue" );

const actor = userEvent.setup( );
const mockSetValue = jest.fn( );

beforeEach( ( ) => {
  mockSetValue.mockClear( );
  useObservationFieldValue.mockImplementation( () => ( {
    value: "",
    setValue: mockSetValue,
  } ) );
} );

describe( "NumericFieldInput", ( ) => {
  it( "reads the OFV value from the hook for the given obsFieldId", ( ) => {
    renderComponent( <NumericFieldInput obsFieldId={100} /> );

    expect( useObservationFieldValue ).toHaveBeenCalledWith( 100 );
  } );

  it( "renders with placeholder", ( ) => {
    renderComponent( <NumericFieldInput obsFieldId={100} /> );

    expect( screen.getByPlaceholderText( "Enter a number" ) ).toBeVisible( );
  } );

  it( "calls setValue with the typed number", async ( ) => {
    renderComponent( <NumericFieldInput obsFieldId={100} /> );

    await actor.type( screen.getByPlaceholderText( "Enter a number" ), "3" );

    expect( mockSetValue ).toHaveBeenCalledWith( "3" );
  } );

  it( "displays an existing OFV value from the hook", ( ) => {
    useObservationFieldValue.mockImplementation( () => ( {
      value: "5",
      setValue: mockSetValue,
    } ) );

    renderComponent( <NumericFieldInput obsFieldId={100} /> );

    expect( screen.getByDisplayValue( "5" ) ).toBeVisible( );
  } );
} );
