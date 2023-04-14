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
    expect( ( ) => render(
      <INatIconButton
        icon="camera"
        width={10}
        onPress={( ) => {
          // all is well
        }}
      />
    ) ).toThrow( /width/i );
  } );

  it( "throws an error when it receives an inaccessibly small height", ( ) => {
    expect( ( ) => render(
      <INatIconButton
        icon="camera"
        height={10}
        onPress={( ) => {
          // all is well
        }}
      />
    ) ).toThrow( /height/i );
  } );
} );
