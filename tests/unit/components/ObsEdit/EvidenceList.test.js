import {
  act, fireEvent, screen, userEvent, waitFor,
} from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";
import { Image } from "react-native";
import { State } from "react-native-gesture-handler";
import { fireGestureHandler, getByGestureTestId } from "react-native-gesture-handler/jest-utils";
import { Images } from "react-native-nitro-image";
import Photo from "realmModels/Photo";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";
import setStoreStateFeatureFlags from "tests/helpers/setStoreStateFeatureFlags";

const initialStoreState = useStore.getState( );

const observationPhotos = [
  factory( "RemoteObservationPhoto" ),
  factory( "RemoteObservationPhoto" ),
];

const mockObservation = factory( "LocalObservation", {
  observationPhotos,
} );

const renderEvidenceList = ( ) => renderComponent(
  <EvidenceList />,
);

describe( "EvidenceList", ( ) => {
  beforeAll( ( ) => {
    useStore.setState( initialStoreState, true );
  } );

  it( "should display add evidence button", ( ) => {
    useStore.setState( {
      observations: [mockObservation],
      currentObservation: mockObservation,
    } );
    renderEvidenceList( );

    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
  } );

  it( "should display loading wheel if photo is saving", ( ) => {
    useStore.setState( {
      observations: [mockObservation],
      currentObservation: mockObservation,
      savingPhoto: true,
    } );
    renderEvidenceList( );

    expect( screen.getByTestId( "EvidenceList.saving" ) ).toBeVisible( );
  } );

  it( "should render all observation photos", ( ) => {
    useStore.setState( {
      observations: [mockObservation],
      currentObservation: mockObservation,
    } );
    renderEvidenceList( );

    expect( screen.getByTestId( `EvidenceList.${observationPhotos[0].photo.url}` ) ).toBeVisible( );
    expect( screen.getByTestId( `EvidenceList.${observationPhotos[1].photo.url}` ) ).toBeVisible( );
  } );

  it( "should display an empty list when observation has no observation photos", ( ) => {
    renderEvidenceList( [] );
    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
    expect( screen.queryByTestId( "ObsEdit.photo" ) ).toBeFalsy( );
  } );

  describe( "editing a photo that has not been uploaded", ( ) => {
    const localFilePath = `${photoUploadPath}/local.jpg`;
    const localPhotoUri = Photo.getLocalPhotoUri( localFilePath );
    const observationWithLocalPhoto = factory( "LocalObservation", {
      observationPhotos: [factory( "LocalObservationPhoto", {
        photo: factory( "LocalPhoto", { url: undefined, localFilePath } ),
      } )],
    } );

    const openLocalPhoto = async actor => {
      useStore.setState( {
        observations: [observationWithLocalPhoto],
        currentObservation: observationWithLocalPhoto,
        currentObservationIndex: 0,
      } );
      renderEvidenceList( );
      await actor.press( screen.getByTestId( `EvidenceList.${localPhotoUri}` ) );
      await screen.findByLabelText( "Delete photo" );
    };

    it( "should not be offered when photo editing is off", async ( ) => {
      setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: false } );
      await openLocalPhoto( userEvent.setup( ) );
      expect( screen.queryByLabelText( "Rotate photo" ) ).toBeNull( );
      expect( screen.queryByLabelText( "Crop photo" ) ).toBeNull( );
    } );

    it( "should point the observation photo at a new rotated file", async ( ) => {
      setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
      const rotatedImage = { saveToFileAsync: jest.fn( ) };
      const originalImage = { rotateAsync: jest.fn( async ( ) => rotatedImage ) };
      Images.loadFromFileAsync.mockResolvedValueOnce( originalImage );
      const actor = userEvent.setup( );
      await openLocalPhoto( actor );

      await actor.press( screen.getByLabelText( "Rotate photo" ) );

      await waitFor( ( ) => {
        const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
        expect( photo.localFilePath ).not.toEqual( localFilePath );
      } );
      const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
      expect( photo.localFilePath ).toMatch( new RegExp( `^${photoUploadPath}/.+\\.jpg$` ) );
      // A quarter turn counterclockwise, in the clockwise degrees nitro-image takes
      expect( originalImage.rotateAsync ).toHaveBeenCalledWith( 270, false );
    } );

    // Opens the cropper on a 2048x1536 photo shown 400x300pt, and returns the
    // image whose cropAsync records the crop
    const openCropper = async ( ) => {
      setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
      jest.spyOn( Image, "getSize" ).mockResolvedValue( { width: 2048, height: 1536 } );
      const croppedImage = { saveToFileAsync: jest.fn( ) };
      // Cropping redraws the photo upright first, even without rotation
      const uprightImage = { cropAsync: jest.fn( async ( ) => croppedImage ) };
      const originalImage = { rotateAsync: jest.fn( async ( ) => uprightImage ) };
      Images.loadFromFileAsync.mockResolvedValueOnce( originalImage );
      const actor = userEvent.setup( );
      await openLocalPhoto( actor );
      await actor.press( screen.getByLabelText( "Crop photo" ) );
      fireEvent( screen.getByTestId( "PhotoCropper" ), "layout", {
        nativeEvent: { layout: { width: 400, height: 300 } },
      } );
      await waitFor( ( ) => {
        expect( getByGestureTestId( "PhotoCropper.handle.bottomRight" ) ).toBeTruthy( );
      } );
      return { actor, uprightImage };
    };

    const drag = ( gestureTestId, translationX, translationY ) => {
      fireGestureHandler( getByGestureTestId( gestureTestId ), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationX: 0, translationY: 0 },
        { state: State.ACTIVE, translationX, translationY },
        { state: State.END, translationX, translationY },
      ] );
    };

    // Letting go of a corner grows the frame to fill the crop area, zooming
    // the photo with it over 300ms. Waits a little longer so the snap is
    // done before the test saves
    const waitForSnap = ( ) => act( ( ) => new Promise( resolve => {
      setTimeout( resolve, 500 );
    } ) );

    it( "should crop the observation photo to the part inside the frame", async ( ) => {
      const { actor, uprightImage } = await openCropper( );

      // Drag the bottom-right corner halfway in, framing the top-left quarter
      drag( "PhotoCropper.handle.bottomRight", -200, -150 );
      await waitForSnap( );
      await actor.press( screen.getByLabelText( "Save crop" ) );

      await waitFor( ( ) => {
        expect( uprightImage.cropAsync ).toHaveBeenCalledWith( 0, 0, 1024, 768 );
      } );
      await waitFor( ( ) => {
        const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
        expect( photo.localFilePath ).not.toEqual( localFilePath );
      } );
    } );

    it( "should let the frame take any shape", async ( ) => {
      const { actor, uprightImage } = await openCropper( );

      // Narrow the frame from the left, then shorten it from the bottom, for
      // a tall frame over the right half of the photo
      drag( "PhotoCropper.handle.topLeft", 200, 0 );
      await waitForSnap( );
      drag( "PhotoCropper.handle.bottomRight", 0, -50 );
      await waitForSnap( );
      await actor.press( screen.getByLabelText( "Save crop" ) );

      await waitFor( ( ) => {
        expect( uprightImage.cropAsync ).toHaveBeenCalledWith( 1024, 0, 2048, 1280 );
      } );
    } );

    it( "should not shrink the frame below its smallest size", async ( ) => {
      const { actor, uprightImage } = await openCropper( );

      // The frame stops at 88pt so its corners' touch areas don't overlap.
      // Drag the bottom-right corner far past the top-left one
      drag( "PhotoCropper.handle.bottomRight", -1000, -1000 );
      await waitForSnap( );
      await actor.press( screen.getByLabelText( "Save crop" ) );

      // The frame stops at 88pt, which shows 451 of the photo's pixels
      // before zooming in
      await waitFor( ( ) => {
        expect( uprightImage.cropAsync ).toHaveBeenCalledWith( 0, 0, 451, 451 );
      } );
    } );

    it( "should stop the frame at the edges of the photo", async ( ) => {
      const { actor, uprightImage } = await openCropper( );

      // Drag a corner of the frame around the whole photo far past the
      // photo's edge
      drag( "PhotoCropper.handle.bottomRight", 1000, 1000 );
      await waitForSnap( );
      await actor.press( screen.getByLabelText( "Save crop" ) );

      // Back to the whole photo, which leaves nothing to crop, so the cropper
      // closes without cropping
      await waitFor( ( ) => {
        expect( screen.queryByTestId( "PhotoCropper" ) ).toBeNull( );
      } );
      expect( uprightImage.cropAsync ).not.toHaveBeenCalled( );
    } );
  } );
} );
