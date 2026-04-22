import { render, screen } from "@testing-library/react-native";
import { INatIcon } from "components/SharedComponents";
import glyphmap from "components/SharedComponents/INatIcon/glyphmap.json";
import React from "react";

const iconName = "camera";

describe( "INatIcon", () => {
  it( "renders correctly", () => {
    render(
      <INatIcon
        name={iconName}
        size={20}
        color="#4F8EF7"
      />,
    );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );

describe( "glyphmap", () => {
  it( "is an object", () => {
    expect( glyphmap ).toBeInstanceOf( Object );
  } );
  it( "has icon name as key", () => {
    expect( glyphmap ).toHaveProperty( iconName );
  } );
} );
