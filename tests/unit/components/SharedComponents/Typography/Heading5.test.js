import { render, screen } from "@testing-library/react-native";
import { Heading5 } from "components/SharedComponents";
import React from "react";

const text = "Heading5";

describe( "Heading5", () => {
  it( "renders correctly", async () => {
    render( <Heading5>{text}</Heading5> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
