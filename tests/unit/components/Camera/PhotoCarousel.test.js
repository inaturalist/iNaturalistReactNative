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
  test( "should render photo in 42px x 42px for sm-lg breakpoint", () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} />
    );

    expect( screen.getAllByTestId( "PhotoCarousel.photo" ) ).toBeTruthy();
    const photos = screen.getAllByTestId( "PhotoCarousel.photo" );
    expect( photos[0] ).toHaveProperty( "props.style.0.3", { height: 42 } );
    expect( photos[0] ).toHaveProperty( "props.style.0.2", { width: 42 } );
  } );

  test( "should render photo in 83px x 83px for xl-2xl breakpoint", () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen />
    );

    expect( screen.getAllByTestId( "PhotoCarousel.photo" ) ).toBeTruthy();
    const photos = screen.getAllByTestId( "PhotoCarousel.photo" );
    expect( photos[0] ).toHaveProperty( "props.style.0.3", { height: 83 } );
    expect( photos[0] ).toHaveProperty( "props.style.0.2", { width: 83 } );
  } );
  it( "renders correctly", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
  it( "renders correctly for large screen", async () => {
    render(
      <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen />
    );

    // Snapshot test
    expect( screen ).toMatchSnapshot();
  } );
} );
