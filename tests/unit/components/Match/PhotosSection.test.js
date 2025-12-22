import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import PhotosSection from "components/Match/PhotosSection";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

describe( "PhotosSection", () => {
  const mockNavToTaxonDetails = jest.fn();

  const defaultProps = {
    representativePhoto: { ...factory( "RemotePhoto" ), ...{ id: 4 } },
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
      expect( screen.getByTestId( "MatchScreen.ObsPhoto" ) ).toBeVisible();
    } );
    expect( screen.getByText( "3" ) ).toBeVisible();
  } );

  it( "hides taxon photos when hideTaxonPhotos is true", async () => {
    renderComponent(
      <PhotosSection
        {...defaultProps}
        hideTaxonPhotos
      />
    );

    await waitFor( () => {
      expect( screen.getByTestId( "MatchScreen.ObsPhoto" ) ).toBeVisible();
    } );
    expect( screen.queryByTestId( "TaxonDetails.photo.1" ) ).toBeFalsy();
    expect( screen.queryByTestId( "TaxonDetails.photo.4" ) ).toBeFalsy();
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
      expect( screen.getByTestId( "TaxonDetails.photo.2" ) ).toBeVisible();
    } );
    expect( screen.queryByTestId( "TaxonDetails.photo.1" ) ).toBeFalsy();
  } ); */

  it( "calls navToTaxonDetails prop when taxon photo is pressed", async () => {
    renderComponent(
      <PhotosSection
        {...defaultProps}
      />
    );

    await waitFor( () => {
      expect( screen.getByTestId( "TaxonDetails.photo.4" ) ).toBeVisible();
    } );

    const photoButton = screen.getByTestId( "TaxonDetails.photo.4" );
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
    await waitFor( () => {
      expect( screen.getByTestId( "TaxonDetails.photo.4" ) ).toBeVisible();
    } );
    expect( screen.getByTestId( "TaxonDetails.photo.1" ) ).toBeVisible();
    expect( screen.getByTestId( "TaxonDetails.photo.2" ) ).toBeVisible();
    expect( screen.queryByTestId( "TaxonDetails.photo.3" ) ).toBeFalsy();
  } );
} );
