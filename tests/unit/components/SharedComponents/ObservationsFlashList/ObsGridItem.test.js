import { render, screen } from "@testing-library/react-native";
import ObsGridItem from "components/SharedComponents/ObservationsFlashList/ObsGridItem";
import initI18next from "i18n/initI18next";
import React from "react";
import factory from "tests/factory";

describe( "ObsGridItem", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  describe( "for an observation with a photo", ( ) => {
    const observationWithPhoto = factory( "LocalObservation", {
      observationPhotos: [factory( "LocalObservationPhoto" )]
    } );

    it( "should render", () => {
      const observationWithStablePhotoUrl = factory( "LocalObservation", {
        uuid: "00000000-0000-0000-0000-000000000000",
        observationPhotos: [
          factory( "LocalObservationPhoto", {
            photo: factory( "LocalPhoto", {
              url: "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg"
            } )
          } )
        ]
      } );
      render(
        <ObsGridItem
          observation={observationWithStablePhotoUrl}
          uploadState={{ uploadProgress: false }}
        />
      );
      expect( screen ).toMatchSnapshot();
    } );

    it( "should have photo", async ( ) => {
      render(
        <ObsGridItem
          observation={observationWithPhoto}
          uploadState={{ uploadProgress: false }}
        />
      );
      expect( await screen.findByTestId( "ObsList.photo" ) ).toBeTruthy( );
    } );
  } );

  describe( "for an observation without a photo", ( ) => {
    const observationWithoutPhoto = factory( "LocalObservation", {
      uuid: "00000000-0000-0000-0000-000000000000"
    } );

    it( "should render", ( ) => {
      render(
        <ObsGridItem
          observation={observationWithoutPhoto}
          uploadState={{ uploadProgress: false }}
        />
      );
      expect( screen ).toMatchSnapshot();
    } );

    it( "should have an iconic taxon icon", async ( ) => {
      render(
        <ObsGridItem
          observation={observationWithoutPhoto}
          uploadState={{ uploadProgress: false }}
        />
      );
      expect( await screen.findByTestId( "IconicTaxonName.iconicTaxonIcon" ) ).toBeTruthy( );
    } );
  } );
} );
