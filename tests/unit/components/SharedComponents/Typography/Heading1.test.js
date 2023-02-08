import { render, screen } from "@testing-library/react-native";
import { Heading1 } from "components/SharedComponents";
import React from "react";

const text = "Heading1";

describe( "Heading1", () => {
  it( "renders correctly", async () => {
    render( <Heading1>{text}</Heading1> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
