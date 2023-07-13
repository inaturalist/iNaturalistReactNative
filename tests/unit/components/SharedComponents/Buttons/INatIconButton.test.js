import { render, screen } from "@testing-library/react-native";
import { INatIconButton } from "components/SharedComponents";
import React from "react";

describe( "INatIconButton", () => {
  it( "renders correctly", () => {
    render(
      <INatIconButton
        icon="camera"
        onPress={( ) => {
          // all is well
        }}
      />
    );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "throws an error when it receives an inaccessibly small width", ( ) => {
    // Even though the error is caught, it still gets printed to the console
    // so we mock that out to avoid the wall of red text.
    jest.spyOn( console, "error" );
    console.error.mockImplementation( () => {} );

    expect( () => render(
      <INatIconButton
        icon="camera"
        width={10}
        onPress={() => {
          // all is well
        }}
      />
    ) ).toThrow( /width/i );

    console.error.mockRestore();
  } );

  it( "throws an error when it receives an inaccessibly small height", ( ) => {
    // Even though the error is caught, it still gets printed to the console
    // so we mock that out to avoid the wall of red text.
    jest.spyOn( console, "error" );
    console.error.mockImplementation( () => {} );

    expect( () => render(
      <INatIconButton
        icon="camera"
        height={10}
        onPress={() => {
          // all is well
        }}
      />
    ) ).toThrow( /height/i );

    console.error.mockRestore();
  } );
} );
