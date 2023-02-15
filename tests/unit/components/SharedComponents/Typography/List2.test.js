import { render, screen } from "@testing-library/react-native";
import { List2 } from "components/SharedComponents";
import React from "react";

const text = "List2";

describe( "List2", () => {
  it( "renders correctly", () => {
    render( <List2>{text}</List2> );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
