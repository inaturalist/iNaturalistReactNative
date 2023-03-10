import { render, screen } from "@testing-library/react-native";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import React from "react";

import factory from "../../../factory";

const mockPhotoUris = [
  factory( "LocalPhoto" ).url,
  factory( "LocalPhoto" ).url,
  factory( "LocalPhoto" ).url
];

describe( "PhotoCarousel", ( ) => {
  test( "should render photo in 42px x 42px for sm breakpoint", () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} screenBreakpoint="sm" />
    );

    expect( screen.getAllByTestId( "ObsEdit.photo" ) ).toBeTruthy();
    const photos = screen.getAllByTestId( "ObsEdit.photo" );
    expect( photos[0] ).toHaveProperty( "props.style.0.3", { height: 42 } );
    expect( photos[0] ).toHaveProperty( "props.style.0.2", { width: 42 } );
  } );

  test( "should render photo in 83px x 83px for lg breakpoint", () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} screenBreakpoint="lg" />
    );

    expect( screen.getAllByTestId( "ObsEdit.photo" ) ).toBeTruthy();
    const photos = screen.getAllByTestId( "ObsEdit.photo" );
    expect( photos[0] ).toHaveProperty( "props.style.0.3", { height: 83 } );
    expect( photos[0] ).toHaveProperty( "props.style.0.2", { width: 83 } );
  } );
  it( "renders correctly for sm breakpoint", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} screenBreakpoint="sm" />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
  it( "renders correctly for lg breakpoint", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} screenBreakpoint="lg" />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
