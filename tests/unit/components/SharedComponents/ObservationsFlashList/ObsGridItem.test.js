import { render, screen } from "@testing-library/react-native";
import ObsGridItem from "components/ObservationsFlashList/ObsGridItem";
import React from "react";
import factory from "tests/factory";

describe( "ObsGridItem", () => {
  describe( "for an observation with a photo", ( ) => {
    const observationWithPhoto = factory( "LocalObservation", {
      observationPhotos: [factory( "LocalObservationPhoto" )],
    } );

    it( "should render", () => {
      const photo = factory( "LocalPhoto", {
        url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
      } );
      const observationWithStablePhotoUrl = factory( "LocalObservation", {
        uuid: "00000000-0000-0000-0000-000000000000",
        observationPhotos: [
          factory( "LocalObservationPhoto", {
            photo,
          } ),
        ],
      } );
      render(
        <ObsGridItem
          observation={observationWithStablePhotoUrl}
          uploadState={{ uploadProgress: false }}
          photo={photo}
        />,
      );
      expect( screen ).toMatchSnapshot();
    } );

    it( "should have photo", async ( ) => {
      const photo = observationWithPhoto?.observationPhotos?.[0]?.photo
        || observationWithPhoto?.observation_photos?.[0]?.photo
        || null;
      render(
        <ObsGridItem
          observation={observationWithPhoto}
          uploadState={{ uploadProgress: false }}
          photo={photo}
        />,
      );
      expect( await screen.findByTestId( "ObsList.photo" ) ).toBeTruthy( );
    } );
  } );

  describe( "for an observation without a photo", ( ) => {
    const observationWithoutPhoto = factory( "LocalObservation", {
      uuid: "00000000-0000-0000-0000-000000000000",
    } );

    it( "should render", ( ) => {
      render(
        <ObsGridItem
          observation={observationWithoutPhoto}
          uploadState={{ uploadProgress: false }}
        />,
      );
      expect( screen ).toMatchSnapshot();
    } );

    it( "should have an iconic taxon icon", async ( ) => {
      render(
        <ObsGridItem
          observation={observationWithoutPhoto}
          uploadState={{ uploadProgress: false }}
        />,
      );
      expect( await screen.findByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy( );
    } );
  } );
} );
