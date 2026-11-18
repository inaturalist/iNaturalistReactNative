import {
  act, fireEvent, screen, waitFor,
} from "@testing-library/react-native";
import StandardCamera from "components/Camera/StandardCamera/StandardCamera";
import i18next from "i18next";
import React from "react";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

jest.mock( "components/MediaViewer/MediaViewerModal", ( ) => jest.fn( ( ) => null ) );

const initialStoreState = useStore.getState( );

const mockPhotoUris = [
  "https://inaturalist-open-data.s3.amazonaws.com/photos/1/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/2/large.jpeg",
  "https://inaturalist-open-data.s3.amazonaws.com/photos/3/large.jpeg",
];

const mockObservation = factory( "RemoteObservation", {
  observationPhotos: [
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[0],
      } ),
    } ),
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[1],
      } ),
    } ),
    factory( "RemoteObservationPhoto", {
      photo: factory( "RemotePhoto", {
        url: mockPhotoUris[2],
      } ),
    } ),
  ],
} );

const renderCamera = ( ) => renderComponent(
  <StandardCamera
    camera={{}}
    device={{}}
    setNewPhotoUris={jest.fn( )}
    newPhotoUris={[]}
  />,
);

beforeAll( async () => {
  useStore.setState( initialStoreState, true );
} );

describe( "StandardCamera", ( ) => {
  beforeEach( ( ) => {
    useStore.setState( {
      currentObservation: mockObservation,
      observations: [mockObservation],
    } );
  } );
  it( "deletes a photo on long press", async ( ) => {
    renderCamera( );
    const { cameraUris } = useStore.getState( );
    const photoImage = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`,
    );
    const predeletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`,
    );
    expect( predeletedPhoto ).toBeVisible( );

    fireEvent( photoImage, "onLongPress" );
    const deleteMode = screen.getByTestId(
      `PhotoCarousel.deletePhoto.${cameraUris[2]}`,
    );
    await waitFor( ( ) => {
      expect( deleteMode ).toBeVisible( );
    } );
    fireEvent.press( deleteMode );

    renderCamera( );

    const undeletedPhoto = screen.getByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[1]}`,
    );
    expect( undeletedPhoto ).toBeVisible( );
    const deletedPhoto = screen.queryByTestId(
      `PhotoCarousel.displayPhoto.${cameraUris[2]}`,
    );
    await waitFor( ( ) => {
      expect( deletedPhoto ).toBeFalsy( );
    } );
  } );
} );

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
