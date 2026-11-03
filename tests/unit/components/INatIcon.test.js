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

  it( "forwards an accessibility label so screen readers read it", () => {
    render(
      <INatIcon
        accessibilityLabel="Meets requirement"
        name={iconName}
        size={20}
      />,
    );

    expect( screen.getByLabelText( "Meets requirement" ) ).toBeVisible( );
  } );

  it( "hides itself from screen readers when told to", () => {
    render(
      <INatIcon
        accessibilityElementsHidden
        importantForAccessibility="no"
        name={iconName}
        size={20}
      />,
    );

    const icon = screen.toJSON( );
    expect( icon ).toHaveProperty( "props.accessibilityElementsHidden", true );
    expect( icon ).toHaveProperty( "props.importantForAccessibility", "no" );
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
