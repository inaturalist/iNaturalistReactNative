import { render, screen, waitFor } from "@testing-library/react-native";
import ObsMedia from "components/ObsDetailsDefaultMode/ObsMedia";
import _ from "lodash";
import React from "react";
import { Image } from "react-native";
import factory from "tests/factory";
import faker from "tests/helpers/faker";

Image.getSize = jest.fn( ( uri, callback ) => {
  callback( { width: 1024, height: 768 } );
} );

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.number.int( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.url( ),
      },
    } ),
  ],
} );

const mockPhotos = _.compact(
  Array.from( mockObservation.observationPhotos ).map( op => op.photo ),
);

const expectedImageSource = [
  {
    height: 75,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 75,
  },
  {
    height: 240,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 240,
  }, {
    height: 500,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 500,
  },
  {
    height: 1024,
    uri: mockObservation.observationPhotos[0].photo.url,
    width: 1024,
  },
];

describe( "ObsMedia", () => {
  // it.todo( "should not have accessibility errors" );
  // it( "should not have accessibility errors", async () => {
  //   const ObsMedia = <ObsMedia photos={mockPhotos} />;
  //   expect( ObsMedia ).toBeAccessible( );
  // } );

  it( "should show photo with given url", async () => {
    render( <ObsMedia photos={mockPhotos} tablet={false} /> );
    const photo = await screen.findByTestId( "ObsMedia.photo" );
    await waitFor( () => {
      expect( photo.props.source ).toStrictEqual( expectedImageSource );
    } );
  } );

  it( "should show photo with given url on tablet", async () => {
    render( <ObsMedia photos={mockPhotos} tablet /> );
    const photo = await screen.findByTestId( "ObsMedia.photo" );
    await waitFor( () => {
      expect( photo.props.source ).toStrictEqual( expectedImageSource );
    } );
  } );
} );
