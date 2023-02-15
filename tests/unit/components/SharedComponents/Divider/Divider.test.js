import { render, screen } from "@testing-library/react-native";
import { Divider } from "components/SharedComponents";
import React from "react";

describe( "Divider", () => {
  it( "should render correctly", () => {
    render( <Divider /> );

    expect( screen ).toMatchSnapshot();
  } );
} );
