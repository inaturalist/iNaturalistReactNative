import { render, screen } from "@testing-library/react-native";
import { Heading3 } from "components/SharedComponents";
import React from "react";

const text = "Heading3";

describe( "Heading3", () => {
  it( "renders correctly", () => {
    render( <Heading3>{text}</Heading3> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
