import { render, screen } from "@testing-library/react-native";
import ARCamera from "components/Camera/ARCamera/ARCamera";
import * as usePredictions from "components/Camera/ARCamera/hooks/usePredictions";
import initI18next from "i18n/initI18next";
import i18next from "i18next";
import React from "react";
import * as useTaxon from "sharedHooks/useTaxon";

const mockTaxonPrediction = {
  id: 144351,
  name: "Poecile",
  rank_level: 20
};

const mockTaxonNoPrediction = {
  id: 3,
  name: "Aves",
  rank_level: 50
};

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url"
  }
};

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockTaxonPrediction
  } )
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => mockLocalTaxon
} ) );

const mockModelLoaded = {
  handleTaxaDetected: jest.fn( ),
  modelLoaded: false,
  result: null
};

jest.mock( "components/Camera/ARCamera/hooks/usePredictions", () => ( {
  __esModule: true,
  default: () => mockModelLoaded
} ) );

jest.mock( "components/Camera/hooks/useZoom", () => ( {
  __esModule: true,
  default: () => ( {
    animatedProps: {}
  }
  )
} ) );

describe( "AR Camera", ( ) => {
  beforeAll( async ( ) => {
    await initI18next( );
  } );
  it( "shows a taxon prediction when result & rank_level < 40", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      result: {
        taxon: mockTaxonPrediction
      }
    } ) );
    render( <ARCamera /> );

    const taxonResult = screen.getByTestId( `ARCamera.taxa.${mockTaxonPrediction.id}` );

    expect( taxonResult ).toBeVisible( );
  } );

  it( "shows scan area text when rank_level > 40", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: true,
      result: {
        taxon: mockTaxonNoPrediction
      }
    } ) );
    render( <ARCamera /> );

    const scanText = screen.getByText( i18next.t( "Scan-the-area-around-you-for-organisms" ) );

    expect( scanText ).toBeVisible( );
  } );

  it( "shows loading text when model not yet loaded", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: false
    } ) );
    render( <ARCamera /> );

    const loadingText = screen.getByText( i18next.t( "Loading-iNaturalists-AR-Camera" ) );

    expect( loadingText ).toBeVisible( );
  } );

  it( "displays taxon photo if taxon exists in realm", ( ) => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon
      }
    } ) );
    render( <ARCamera /> );

    const taxonPhoto = screen.getByTestId( "ObsList.photo" );

    expect( taxonPhoto.props.source ).toStrictEqual(
      {
        uri: mockLocalTaxon.default_photo.url
      }
    );
  } );

  it( "displays iconic taxon icon if taxon does not exist in realm", ( ) => {
    jest.spyOn( useTaxon, "default" ).mockImplementation( () => ( {
      ...mockLocalTaxon,
      default_photo: {
        url: null
      }
    } ) );
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon
      }
    } ) );
    render( <ARCamera /> );

    const taxonIcon = screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" );

    expect( taxonIcon ).toBeVisible( );
  } );
} );
