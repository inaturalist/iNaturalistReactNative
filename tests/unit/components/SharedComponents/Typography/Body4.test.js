import { render, screen } from "@testing-library/react-native";
import { Body4 } from "components/SharedComponents";
import React from "react";

const text = "Body4";

describe( "Body4", () => {
  it( "renders correctly", () => {
    render( <Body4>{text}</Body4> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
