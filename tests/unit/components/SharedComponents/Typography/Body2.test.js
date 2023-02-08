import { render, screen } from "@testing-library/react-native";
import { Body2 } from "components/SharedComponents";
import React from "react";

const text = "Body2";

describe( "Body2", () => {
  it( "renders correctly", async () => {
    render( <Body2>{text}</Body2> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
