import { render, screen } from "@testing-library/react-native";
import { Subheading1 } from "components/SharedComponents";
import React from "react";

const text = "Subheading1";

describe( "Subheading1", () => {
  it( "renders correctly", async () => {
    render( <Subheading1>{text}</Subheading1> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
