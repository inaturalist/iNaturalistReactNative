import {
  render, screen
} from "@testing-library/react-native";
import PhotoCarousel from "components/Camera/StandardCamera/PhotoCarousel.tsx";
import React from "react";
import useStore from "stores/useStore";

jest.mock( "components/MediaViewer/MediaViewerModal", ( ) => jest.fn( ( ) => null ) );

const initialStoreState = useStore.getState( );

// For snapshots we want test data not to be random
const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/2/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/3/large.jpeg"
];

describe( "PhotoCarousel", ( ) => {
  beforeAll( async () => {
    useStore.setState( initialStoreState, true );
  } );
  // There were some tests of photo sizes responding to the isLargeScreen prop
  // but somewhat dynamic tailwind classes don't seem to create style props
  // in a test environment, so I'm not sure we can test those now ~~~kueda
  // 20230518
  it( "renders correctly", async () => {
    render( <PhotoCarousel photoUris={mockPhotoUris} /> );

    await screen.findByTestId( `PhotoCarousel.displayPhoto.${mockPhotoUris[0]}` );

    expect( screen ).toMatchSnapshot();
  } );

  it( "renders correctly for large screen", async () => {
    render( <PhotoCarousel photoUris={mockPhotoUris} isLargeScreen /> );

    await screen.findByTestId( `PhotoCarousel.displayPhoto.${mockPhotoUris[0]}` );

    expect( screen ).toMatchSnapshot();
  } );
} );
