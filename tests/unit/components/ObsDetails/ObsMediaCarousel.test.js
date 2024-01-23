import { faker } from "@faker-js/faker";
import { render, screen } from "@testing-library/react-native";
import ObsMediaCarousel from "components/ObsDetails/ObsMediaCarousel";
import initI18next from "i18n/initI18next";
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

describe( "ObsMediaCarousel", () => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );

  // it.todo( "should not have accessibility errors" );
  // it( "should not have accessibility errors", async () => {
  //   const ObsMediaCarousel = <ObsMediaCarousel photos={mockPhotos} />;
  //   expect( ObsMediaCarousel ).toBeAccessible( );
  // } );

  it( "should show photo with given url", async () => {
    render( <ObsMediaCarousel photos={mockPhotos} /> );
    const photo = await screen.findByTestId( "ObsMediaCarousel.photo" );
    expect( photo.props.source ).toStrictEqual(
      {
        uri: mockObservation.observationPhotos[0].photo.url
      }
    );
  } );
} );
