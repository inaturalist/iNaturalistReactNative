import { render, screen } from "@testing-library/react-native";
import { INatIcon } from "components/SharedComponents";
import { glyphMap } from "components/SharedComponents/INatIcon/INatIcon";
import React from "react";

const iconName = "camera";

describe( "INatIcon", () => {
  it( "renders correctly", () => {
    render(
      <INatIcon
        name={iconName}
        size={20}
        color="#4F8EF7"
      />
    );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );

describe( "glyphMap", () => {
  it( "is an object", () => {
    expect( glyphMap ).toBeInstanceOf( Object );
  } );
  it( "has icon name as key", () => {
    expect( glyphMap ).toHaveProperty( iconName );
  } );
} );
