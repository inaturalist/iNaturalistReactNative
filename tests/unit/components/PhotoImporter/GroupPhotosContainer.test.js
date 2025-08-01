import { fireEvent, screen } from "@testing-library/react-native";
import GroupPhotosContainer from "components/PhotoImporter/GroupPhotosContainer";
import React from "react";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const mockGroupedPhotos = [{
  photos: [{
    image: {
      uri: "url_1"
    }
  }]
}, {
  photos: [{
    image: {
      uri: "url_2"
    }
  }]
}, {
  photos: [{
    image: {
      uri: "url_3"
    }
  }]
}
];

describe( "GroupPhotosContainer", ( ) => {
  beforeAll( async ( ) => {
    useStore.setState( initialStoreState, true );
  } );

  afterEach( () => {
    jest.clearAllMocks( );
  } );

  it( "combines photos", async ( ) => {
    useStore.setState( { groupedPhotos: mockGroupedPhotos } );
    renderComponent( <GroupPhotosContainer /> );

    const firstPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[0].photos[0].image.uri}`
    );
    fireEvent.press( firstPhotoPressable );
    const secondPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[1].photos[0].image.uri}`
    );
    fireEvent.press( secondPhotoPressable );

    const combinePhotosButton = screen.getByLabelText( /Combine Photos/ );
    expect( combinePhotosButton ).toBeTruthy( );
    fireEvent.press( combinePhotosButton );

    const { groupedPhotos } = useStore.getState( );

    const firstPhotoCombinedPressable = screen.getByTestId(
      `GroupPhotos.${groupedPhotos[0].photos[0].image.uri}`
    );

    expect( firstPhotoCombinedPressable ).toHaveTextContent( /2/ );
  } );

  it( "combines previously combined photos", async ( ) => {
    useStore.setState( { groupedPhotos: mockGroupedPhotos } );
    renderComponent( <GroupPhotosContainer /> );

    const firstPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[0].photos[0].image.uri}`
    );
    fireEvent.press( firstPhotoPressable );
    const secondPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[1].photos[0].image.uri}`
    );
    fireEvent.press( secondPhotoPressable );

    const combinePhotosButton = screen.getByLabelText( /Combine Photos/ );
    fireEvent.press( combinePhotosButton );

    const { groupedPhotos } = useStore.getState( );

    const firstPhotoCombinedPressable = screen.getByTestId(
      `GroupPhotos.${groupedPhotos[0].photos[0].image.uri}`
    );
    const secondPhotoCombinedPressable = screen.getByTestId(
      `GroupPhotos.${groupedPhotos[1].photos[0].image.uri}`
    );
    fireEvent.press( firstPhotoCombinedPressable );
    fireEvent.press( secondPhotoCombinedPressable );
    fireEvent.press( combinePhotosButton );

    expect( firstPhotoCombinedPressable ).toHaveTextContent( /3/ );
  } );

  it( "separates combined photos", async ( ) => {
    useStore.setState( { groupedPhotos: mockGroupedPhotos } );
    renderComponent( <GroupPhotosContainer /> );

    const firstPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[0].photos[0].image.uri}`
    );
    fireEvent.press( firstPhotoPressable );
    const secondPhotoPressable = screen.getByTestId(
      `GroupPhotos.${mockGroupedPhotos[1].photos[0].image.uri}`
    );
    fireEvent.press( secondPhotoPressable );

    const combinePhotosButton = screen.getByLabelText( /Combine Photos/ );
    fireEvent.press( combinePhotosButton );

    const { groupedPhotos } = useStore.getState( );

    const firstPhotoCombinedPressable = screen.getByTestId(
      `GroupPhotos.${groupedPhotos[0].photos[0].image.uri}`
    );
    const secondPhotoCombinedPressable = screen.getByTestId(
      `GroupPhotos.${groupedPhotos[1].photos[0].image.uri}`
    );
    fireEvent.press( firstPhotoCombinedPressable );
    fireEvent.press( secondPhotoCombinedPressable );
    const separatePhotosButton = screen.getByLabelText( /Separate Photos/ );
    fireEvent.press( separatePhotosButton );

    const photoCount = screen.queryByTestId( "photo-count" );
    expect( photoCount ).toBeFalsy( );
  } );
} );
