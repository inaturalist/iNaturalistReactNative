import { render, screen } from "@testing-library/react-native";
import { List1 } from "components/SharedComponents";
import React from "react";

const text = "List1";

describe( "List1", () => {
  it( "renders correctly", async () => {
    render( <List1>{text}</List1> );
    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
