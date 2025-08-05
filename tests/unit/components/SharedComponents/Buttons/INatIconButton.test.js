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
        accessibilityLabel="Camera"
      />
    );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );

  it( "throws an error when it receives an inaccessibly small width", ( ) => {
    // Even though the error is caught, it still gets printed to the console
    // so we mock that out to avoid the wall of red text.
    jest.spyOn( console, "error" );
    console.error.mockImplementation( () => undefined );

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
    console.error.mockImplementation( () => undefined );

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

it( "should be accessible if accessibility label is passes as props", ( ) => {
  // Disabled during the update to RN 0.78
  // expect(
  //   <INatIconButton
  //     icon="camera"
  //     onPress={jest.fn( )}
  //     accessibilityLabel="Navigate to camera"
  //   />
  // ).toBeAccessible( );
} );

it( "throws an error when no accessibility label is passed into props", ( ) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  jest.spyOn( console, "error" );
  console.error.mockImplementation( () => undefined );

  expect( () => render(
    <INatIconButton
      icon="camera"
    />
  ) ).toThrow( /accessibility/i );

  console.error.mockRestore( );
} );
