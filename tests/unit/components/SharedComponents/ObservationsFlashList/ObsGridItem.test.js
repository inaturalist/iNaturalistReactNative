import { render, screen } from "@testing-library/react-native";
import ObsGridItem from "components/SharedComponents/ObservationsFlashList/ObsGridItem";
import initI18next from "i18n/initI18next";
import React from "react";

import factory from "../../../../factory";

describe( "ObsGridItem", () => {
  beforeAll( async () => {
    await initI18next();
  } );

  describe( "for an observation with a photo", ( ) => {
    const observationWithPhoto = factory( "LocalObservation", {
      // ObsGridItem contains a testID that uses the obs UUID, so in order for
      // this to be deterministic, we need to manually set the UUID so it's
      // the same for every run
      uuid: "00000000-0000-0000-0000-000000000000",
      observationPhotos: [factory( "LocalObservationPhoto" )]
    } );

    it( "should render", () => {
      render(
        <ObsGridItem
          observation={observationWithPhoto}
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
