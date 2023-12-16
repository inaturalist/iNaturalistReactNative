import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react-native";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import _ from "lodash";
import React from "react";
import factory from "tests/factory";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.url( )
      }
    } )
  ]
} );

const mockPhotos = _.compact(
  Array.from( mockObservation.observationPhotos ).map( op => op.photo )
);

describe( "PhotosScroll", () => {
  it.todo( "should not have accessibility errors" );
  // it( "should not have accessibility errors", async () => {
  //   const photoScroll = <PhotoScroll photos={mockPhotos} />;
  //   expect( photoScroll ).toBeAccessible( );
  // } );

  it( "should show the main carousel", async () => {
    render( <PhotoScroll photos={mockPhotos} /> );
    expect( screen.getByTestId( "photo-scroll" ) ).toBeTruthy();
  } );

  it( "should show photo with given url", async () => {
    render( <PhotoScroll photos={mockPhotos} /> );
    const photo = await screen.findByTestId( "PhotoScroll.photo" );
    expect( photo.props.source ).toStrictEqual(
      {
        uri: mockObservation.observationPhotos[0].photo.url
      }
    );
  } );
} );
