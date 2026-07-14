import { screen, userEvent } from "@testing-library/react-native";
import TextFieldInput from "components/AddToProjects/FieldInputs/TextFieldInput";
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

describe( "TextFieldInput", ( ) => {
  it( "reads the OFV value from the hook for the given obsFieldId", ( ) => {
    renderComponent( <TextFieldInput obsFieldId={100} /> );

    expect( useObservationFieldValue ).toHaveBeenCalledWith( 100 );
  } );

  it( "renders with enter-a-response placeholder", ( ) => {
    renderComponent( <TextFieldInput obsFieldId={100} /> );

    expect( screen.getByPlaceholderText( "Enter a response" ) ).toBeVisible( );
  } );

  it( "displays an existing OFV value from the hook", ( ) => {
    useObservationFieldValue.mockImplementation( () => ( {
      value: "test",
      setValue: mockSetValue,
    } ) );

    renderComponent( <TextFieldInput obsFieldId={100} /> );

    expect( screen.getByDisplayValue( "test" ) ).toBeVisible( );
  } );

  it( "calls setValue with typed text", async ( ) => {
    renderComponent( <TextFieldInput obsFieldId={100} /> );

    await actor.type( screen.getByPlaceholderText( "Enter a response" ), "h" );

    expect( mockSetValue ).toHaveBeenCalledWith( "h" );
  } );
} );
