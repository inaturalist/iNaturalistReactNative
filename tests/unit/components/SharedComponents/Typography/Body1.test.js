import { render, screen } from "@testing-library/react-native";
import { Body1 } from "components/SharedComponents";
import React from "react";

const text = "Body1";

describe( "Body1", () => {
  it( "renders correctly", async () => {
    render( <Body1>{text}</Body1> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
