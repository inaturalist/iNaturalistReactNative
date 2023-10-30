import { render, screen } from "@testing-library/react-native";
import ARCamera from "components/Camera/ARCamera/ARCamera";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";

const mockTaxonPrediction = {
  id: 144351,
  name: "Poecile",
  rank_level: 20
};

const mockTaxon = {
  id: 3,
  name: "Aves",
  rank_level: 50
};

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockTaxonPrediction
  } )
} ) );

describe( "AR Camera", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  it( "shows a taxon prediction when result & rank_level < 40", async () => {
    render(
      <ARCamera
        result={{
          taxon: mockTaxonPrediction
        }}
      />
    );

    const taxonResult = screen.getByTestId( `ARCamera.taxa.${mockTaxonPrediction.id}` );

    expect( taxonResult ).toBeVisible( );
  } );

  it( "shows scan area text when rank_level > 40", async () => {
    render(
      <ARCamera
        result={{
          taxon: mockTaxon
        }}
        modelLoaded
      />
    );

    const scanText = screen.getByText( i18next.t( "Scan-the-area-around-you-for-organisms" ) );

    expect( scanText ).toBeVisible( );
  } );

  it( "shows loading text when model not yet loaded", async () => {
    render(
      <ARCamera
        modelLoaded={false}
        result={null}
      />
    );

    const loadingText = screen.getByText( i18next.t( "Loading-iNaturalists-AR-Camera" ) );

    expect( loadingText ).toBeVisible( );
  } );
} );
