import { render, screen } from "@testing-library/react-native";
import { Body3 } from "components/SharedComponents";
import React from "react";

const text = "Body3";

describe( "Body3", () => {
  it( "renders correctly", () => {
    render( <Body3>{text}</Body3> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
