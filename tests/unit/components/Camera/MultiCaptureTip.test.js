import { act, screen, waitFor } from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera/StandardCamera";
import i18next from "i18next";
import React from "react";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MediaViewer/MediaViewerModal", ( ) => jest.fn( ( ) => null ) );

const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
];

describe( "StandardCamera multi-capture tip", ( ) => {
  const tipText = ( ) => i18next.t(
    "Take-photos-from-different-angles-to-help-with-identification",
  );
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
  const renderCameraWithNewPhotos = newPhotoUris => renderComponent(
    <StandardCamera
      camera={{}}
      device={{}}
      setNewPhotoUris={jest.fn( )}
      newPhotoUris={newPhotoUris}
    />,
  );

  beforeEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( true );
  } );

  afterEach( ( ) => {
    resetShownOnce( );
    setOnboardingFlag( false );
  } );

  it( "is not shown while the onboarding flag is off", ( ) => {
    setOnboardingFlag( false );
    renderCameraWithNewPhotos( [] );

    expect( screen.queryByText( tipText( ) ) ).toBeFalsy( );
  } );

  it( "is shown until the first photo is taken, then never again", async ( ) => {
    const { unmount: unmountFirst } = renderCameraWithNewPhotos( [] );
    expect( screen.getByText( tipText( ) ) ).toBeVisible( );
    unmountFirst( );

    // Still there next time when no photo was taken
    const { unmount: unmountSecond } = renderCameraWithNewPhotos( [] );
    expect( screen.getByText( tipText( ) ) ).toBeVisible( );
    unmountSecond( );

    const { unmount: unmountThird } = renderCameraWithNewPhotos( [mockPhotoUris[0]] );
    await waitFor( ( ) => {
      expect( screen.queryByText( tipText( ) ) ).toBeFalsy( );
    } );
    unmountThird( );

    renderCameraWithNewPhotos( [] );
    expect( screen.queryByText( tipText( ) ) ).toBeFalsy( );
  } );
} );
