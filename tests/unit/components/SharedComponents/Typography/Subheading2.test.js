import { render, screen } from "@testing-library/react-native";
import { Subheading2 } from "components/SharedComponents";
import React from "react";

const text = "Subheading2";

describe( "Subheading2", () => {
  it( "renders correctly", () => {
    render( <Subheading2>{text}</Subheading2> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
