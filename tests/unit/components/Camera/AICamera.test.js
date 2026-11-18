import {
  act, fireEvent, render, screen,
} from "@testing-library/react-native";
import AICamera from "components/Camera/AICamera/AICamera";
import * as usePredictions from "components/Camera/AICamera/hooks/usePredictions";
import i18next from "i18next";
import React from "react";
import { AccessibilityInfo } from "react-native";
import * as useTaxon from "sharedHooks/useTaxon";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const mockTaxonPrediction = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
};

const mockTaxonNoPrediction = {
  id: 3,
  name: "Aves",
  rank_level: 50,
};

const mockLocalTaxon = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
  default_photo: {
    url: "fake_image_url",
  },
};

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: mockTaxonPrediction,
  } ),
} ) );

jest.mock( "sharedHooks/useTaxon", () => ( {
  __esModule: true,
  default: () => ( { taxon: mockLocalTaxon } ),
} ) );

const mockModelLoaded = {
  handleTaxaDetected: jest.fn( ),
  modelLoaded: false,
  result: null,
};

jest.mock( "components/Camera/AICamera/hooks/usePredictions", () => ( {
  __esModule: true,
  default: () => mockModelLoaded,
} ) );

jest.mock( "components/Camera/hooks/useZoom", () => ( {
  __esModule: true,
  default: () => ( {
    zoom: 1,
  }
  ),
} ) );

describe( "AI Camera", ( ) => {
  it( "shows a taxon prediction when result & rank_level < 40", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      result: {
        taxon: mockTaxonPrediction,
      },
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
        taxon: mockTaxonNoPrediction,
      },
    } ) );
    render( <AICamera /> );

    const scanText = screen.getByText(
      i18next.t( "Point-the-camera-at-an-animal-plant-or-fungus" ),
    );

    expect( scanText ).toBeVisible( );
  } );

  it( "shows loading text when model not yet loaded", async () => {
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: false,
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
        taxon: mockLocalTaxon,
      },
    } ) );
    render( <AICamera /> );

    const taxonPhoto = screen.getByTestId( "ObsList.photo" );

    expect( taxonPhoto.props.source ).toMatchObject(
      {
        url: mockLocalTaxon.default_photo.url,
      },
    );
  } );

  it( "displays iconic taxon icon if taxon does not exist in realm", ( ) => {
    jest.spyOn( useTaxon, "default" ).mockImplementation( () => ( {
      taxon: {
        ...mockLocalTaxon,
        default_photo: {
          url: null,
        },
      },
    } ) );
    jest.spyOn( usePredictions, "default" ).mockImplementation( () => ( {
      ...mockModelLoaded,
      modelLoaded: true,
      result: {
        taxon: mockLocalTaxon,
      },
    } ) );
    render( <AICamera /> );

    const taxonIcon = screen.getByTestId( "IconicTaxonName.iconicTaxonIcon" );

    expect( taxonIcon ).toBeVisible( );
  } );
} );

describe( "AI Camera one-time tips", ( ) => {
  const sheetHeader = ( ) => i18next.t( "What-makes-a-good-observation" );
  const coachmarkText = ( ) => i18next.t( "You-can-also-upload-photos-from-your-gallery" );
  // Components from the previous test can still be mounted, hence act
  const setOnboardingFlag = enabled => act( ( ) => {
    useStore.getState( ).setFeatureFlagApiValues(
      { [FeatureFlag.OnboardingV2Enabled]: enabled },
      true,
    );
  } );
  const resetShownOnce = ( ) => act( ( ) => {
    useStore.getState( ).layout.resetShownOnce( );
  } );

  beforeEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( true );
  } );

  afterEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( false );
  } );

  it( "shows no tips while the onboarding flag is off", ( ) => {
    setOnboardingFlag( false );
    render( <AICamera /> );

    expect( screen.queryByText( sheetHeader( ) ) ).toBeFalsy( );
    expect( screen.queryByTestId( "UploadCoachmark" ) ).toBeFalsy( );
  } );

  it( "shows the good-observation sheet first, without the coachmark", ( ) => {
    render( <AICamera /> );

    expect( screen.getByText( sheetHeader( ) ) ).toBeVisible( );
    expect( screen.queryByTestId( "UploadCoachmark" ) ).toBeFalsy( );
  } );

  it( "replaces the sheet with the upload coachmark on continue, for good", ( ) => {
    const { unmount } = render( <AICamera /> );

    fireEvent.press( screen.getByTestId( "GoodObservationSheet.continue" ) );

    expect( screen.queryByText( sheetHeader( ) ) ).toBeFalsy( );
    expect( screen.getByText( coachmarkText( ) ) ).toBeVisible( );

    unmount( );
    render( <AICamera /> );
    expect( screen.queryByText( sheetHeader( ) ) ).toBeFalsy( );
  } );

  it( "announces the coachmark and dismisses it on the next touch", ( ) => {
    const announce = jest.spyOn( AccessibilityInfo, "announceForAccessibility" );
    useStore.getState( ).layout.setShownOnce( "camera-tip-good-observation" );
    render( <AICamera /> );

    expect( announce ).toHaveBeenCalledWith( coachmarkText( ) );

    // Touches bubble, so one on any control reaches the camera's root view
    fireEvent( screen.getByTestId( "take-photo-button" ), "touchStart" );

    expect( screen.queryByTestId( "UploadCoachmark" ) ).toBeFalsy( );
    expect( useStore.getState( ).layout.shownOnce["camera-tip-upload"] ).toBe( true );
  } );

  it( "does not show the coachmark again after the camera was left", ( ) => {
    useStore.getState( ).layout.setShownOnce( "camera-tip-good-observation" );
    const { unmount } = render( <AICamera /> );
    expect( screen.getByTestId( "UploadCoachmark" ) ).toBeVisible( );

    unmount( );
    render( <AICamera /> );

    expect( screen.queryByTestId( "UploadCoachmark" ) ).toBeFalsy( );
  } );
} );
