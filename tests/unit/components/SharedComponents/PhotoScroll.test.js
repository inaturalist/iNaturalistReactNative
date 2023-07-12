import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import PhotoScroll from "components/SharedComponents/PhotoScroll";
import _ from "lodash";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const mockObservation = factory( "LocalObservation", {
  created_at: "2022-11-27T19:07:41-08:00",
  time_observed_at: "2023-12-14T21:07:41-09:30",
  observationPhotos: [
    factory( "LocalObservationPhoto", {
      photo: {
        id: faker.datatype.number( ),
        attribution: faker.lorem.sentence( ),
        licenseCode: "cc-by-nc",
        url: faker.image.imageUrl( )
      }
    } )
  ]
} );

const mockPhotos = _.compact(
  Array.from( mockObservation.observationPhotos ).map( op => op.photo )
);

describe( "PhotosScroll", () => {
  // test( "should not have accessibility errors", async () => {
  //   const photoScroll = <PhotoScroll photos={mockPhotos} />;

  //   expect( photoScroll ).toBeAccessible();
  // } );

  test( "should render correctly", async () => {
    renderComponent( <PhotoScroll photos={mockPhotos} /> );

    const photoScroll = await screen.findByTestId( "photo-scroll" );

    expect( photoScroll ).toBeTruthy();
  } );

  test( "should show photo with given url", async () => {
    renderComponent( <PhotoScroll photos={mockPhotos} /> );

    const photo = await screen.findByTestId( "PhotoScroll.photo" );

    expect( photo.props.source ).toStrictEqual(
      {
        uri: mockObservation.observationPhotos[0].photo.url
      }
    );
  } );
} );
