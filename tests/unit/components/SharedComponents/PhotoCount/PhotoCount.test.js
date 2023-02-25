import { render, screen } from "@testing-library/react-native";
import { PhotoCount } from "components/SharedComponents";
import React from "react";

describe( "PhotosCount", () => {
  it( "should render correctly", () => {
    render( <PhotoCount count={10} /> );

    const photoCount = screen.queryByTestId( "photo-count" );

    expect( photoCount ).toBeTruthy();
  } );

  it( "should not render when photo count equal to 0", () => {
    render( <PhotoCount count={0} /> );

    const photoCount = screen.queryByTestId( "photo-count" );

    expect( photoCount ).toBeNull();
  } );

  it( "should show the correct value", () => {
    render( <PhotoCount count={14} /> );

    expect( screen ).toMatchSnapshot();
  } );

  it( "should show photo count value equal to 99", () => {
    render( <PhotoCount count={200} /> );

    expect( screen ).toMatchSnapshot();
  } );
} );
