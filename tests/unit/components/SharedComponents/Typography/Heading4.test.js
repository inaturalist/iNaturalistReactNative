import { render, screen } from "@testing-library/react-native";
import { Heading4 } from "components/SharedComponents";
import React from "react";

const text = "Heading4";

describe( "Heading4", () => {
  it( "renders correctly", async () => {
    render( <Heading4>{text}</Heading4> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
