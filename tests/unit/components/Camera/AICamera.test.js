import { render, screen } from "@testing-library/react-native";
import AICamera from "components/Camera/AICamera/AICamera";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions.ts";
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
  default: () => ( { taxon: mockLocalTaxon } )
} ) );

const mockModelLoaded = {
  handleTaxaDetected: jest.fn( ),
  modelLoaded: false,
  result: null
};

jest.mock( "components/Camera/AICamera/hooks/usePredictions", () => ( {
  __esModule: true,
  default: () => mockModelLoaded
} ) );

jest.mock( "components/Camera/hooks/useZoom.ts", () => ( {
  __esModule: true,
  default: () => ( {
    animatedProps: {}
  }
  )
} ) );

describe( "AI Camera", ( ) => {
  it( "shows a taxon prediction when result & rank_level < 40", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      result: {
        taxon: mockTaxonPrediction
      }
    } ) );
    render( <AICamera /> );

    const taxonResult = screen.getByTestId( `AICamera.taxa.${mockTaxonPrediction.id}` );

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
    render( <AICamera /> );

    const scanText = screen.getByText(
      i18next.t( "Point-the-camera-at-an-animal-plant-or-fungus" )
    );

    expect( scanText ).toBeVisible( );
  } );

  it( "shows loading text when model not yet loaded", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: false
    } ) );
    render( <AICamera /> );

    const loadingText = screen.getByText( i18next.t( "Loading-iNaturalists-AI-Camera" ) );

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
    render( <AICamera /> );

    const taxonPhoto = screen.getByTestId( "ObsList.photo" );

    expect( taxonPhoto.props.source ).toMatchObject(
      {
        url: mockLocalTaxon.default_photo.url
      }
    );
  } );

  it( "displays iconic taxon icon if taxon does not exist in realm", ( ) => {
    jest.spyOn( useTaxon, "default" ).mockImplementation( () => ( {
      taxon: {
        ...mockLocalTaxon,
        default_photo: {
          url: null
        }
      }
    } ) );
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon
      }
    } ) );
    render( <AICamera /> );

    const taxonIcon = screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" );

    expect( taxonIcon ).toBeVisible( );
  } );
} );
