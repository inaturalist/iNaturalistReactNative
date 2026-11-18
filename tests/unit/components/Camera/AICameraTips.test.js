import {
  act, fireEvent, render, screen,
} from "@testing-library/react-native";
import AICamera from "components/Camera/AICamera/AICamera";
import i18next from "i18next";
import React from "react";
import { AccessibilityInfo } from "react-native";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const mockTaxonPrediction = {
  id: 144351,
  name: "Poecile",
  rank_level: 20,
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
    fireEvent( screen.getByLabelText( i18next.t( "Close" ) ), "touchStart" );

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
