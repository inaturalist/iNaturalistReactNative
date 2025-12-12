import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import PhotosSection from "components/Match/PhotosSection";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "PhotosSection", () => {
  const mockNavToTaxonDetails = jest.fn();

  const defaultProps = {
    representativePhoto: factory( "RemotePhoto" ),
    obsPhotos: [factory( "LocalObservationPhoto" )],
    navToTaxonDetails: mockNavToTaxonDetails,
    taxon: factory( "LocalTaxon", {
      taxonPhotos: [
        { photo: factory( "RemotePhoto", { id: 1 } ) },
        { photo: factory( "RemotePhoto", { id: 2 } ) },
        { photo: factory( "RemotePhoto", { id: 3 } ) }
      ]
    } )
  };

  it( "displays photo count when multiple observation photos exist", async () => {
    const multipleObsPhotos = [
      factory( "LocalObservationPhoto" ),
      factory( "LocalObservationPhoto" ),
      factory( "LocalObservationPhoto" )
    ];

    renderComponent(
      <PhotosSection
        {...defaultProps}
        obsPhotos={multipleObsPhotos}
      />
    );

    await waitFor( () => {
      expect( screen.getByTestId( "MatchScreen.ObsPhoto" ) ).toBeTruthy();
    } );
    expect( screen.getByText( "3" ) ).toBeTruthy();
  } );

  it( "hides taxon photos when hideTaxonPhotos is true", async () => {
    renderComponent(
      <PhotosSection
        {...defaultProps}
        hideTaxonPhotos
      />
    );

    await waitFor( () => {
      expect( screen.queryByTestId( "TaxonDetails.photo.1" ) ).toBeFalsy();
    } );
  } );

  // Not working due to known bug: https://linear.app/inaturalist/issue/MOB-1069/taxon-photos-hidden-for-iconic-taxa-match-screens
  /* it( "does not render iconic taxon photos", async () => {
    renderComponent(
      <PhotosSection
        {...defaultProps}
        taxon={{ ...defaultProps.taxon, isIconic: true }}
      />
    );

    await waitFor( () => {
      expect( screen.getByTestId( "TaxonDetails.photo.2" ) ).toBeTruthy();
    } );
    expect( screen.queryByTestId( "TaxonDetails.photo.1" ) ).toBeFalsy();
  } ); */

  it( "navigates to taxon details when taxon photo is pressed", async () => {
    const taxonWithPhoto = factory( "LocalTaxon", {
      taxonPhotos: [
        { photo: factory( "RemotePhoto", { id: 1 } ) },
        { photo: factory( "RemotePhoto", { id: 2 } ) },
        { photo: factory( "RemotePhoto", { id: 3 } ) }
      ]
    } );

    renderComponent(
      <PhotosSection
        {...defaultProps}
        taxon={taxonWithPhoto}
      />
    );

    const repPhotoId = defaultProps.representativePhoto.id;
    await waitFor( () => {
      expect( screen.getByTestId( `TaxonDetails.photo.${repPhotoId}` ) ).toBeTruthy();
    } );

    const photoButton = screen.getByTestId( `TaxonDetails.photo.${repPhotoId}` );
    fireEvent.press( photoButton );

    expect( mockNavToTaxonDetails ).toHaveBeenCalled();
  } );

  it( "limits displayed taxon photos to maximum of 3", async () => {
    renderComponent(
      <PhotosSection
        {...defaultProps}
      />
    );

    // Representative photo + 2 more = 3 total
    const repPhotoId = defaultProps.representativePhoto.id;
    await waitFor( () => {
      expect( screen.getByTestId( `TaxonDetails.photo.${repPhotoId}` ) ).toBeTruthy();
    } );
    expect( screen.getByTestId( "TaxonDetails.photo.1" ) ).toBeTruthy();
    expect( screen.getByTestId( "TaxonDetails.photo.2" ) ).toBeTruthy();
    expect( screen.queryByTestId( "TaxonDetails.photo.3" ) ).toBeFalsy();
  } );
} );
