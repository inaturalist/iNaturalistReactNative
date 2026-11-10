import {
  fireEvent, screen, userEvent, waitFor,
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
      const actor = userEvent.setup( );
      await openLocalPhoto( actor );

      await actor.press( screen.getByLabelText( "Rotate photo" ) );

      await waitFor( ( ) => {
        const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
        expect( photo.localFilePath ).not.toEqual( localFilePath );
      } );
      const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
      expect( photo.localFilePath ).toMatch( new RegExp( `^${photoUploadPath}/.+\\.jpg$` ) );
    } );

    it( "should crop the observation photo to the part inside the frame", async ( ) => {
      setStoreStateFeatureFlags( { [FeatureFlag.PhotoEditingEnabled]: true } );
      jest.spyOn( Image, "getSize" ).mockResolvedValue( { width: 2048, height: 1536 } );
      const croppedImage = { saveToFileAsync: jest.fn( ) };
      const originalImage = { cropAsync: jest.fn( async ( ) => croppedImage ) };
      Images.loadFromFileAsync.mockResolvedValueOnce( originalImage );
      const actor = userEvent.setup( );
      await openLocalPhoto( actor );

      await actor.press( screen.getByLabelText( "Crop photo" ) );
      // Show the 2048x1536 photo 400x300pt, then drag the bottom-right corner
      // halfway in, framing the top-left quarter of the photo
      fireEvent( screen.getByTestId( "PhotoCropper" ), "layout", {
        nativeEvent: { layout: { width: 400, height: 300 } },
      } );
      await waitFor( ( ) => {
        expect( getByGestureTestId( "PhotoCropper.handle.bottomRight" ) ).toBeTruthy( );
      } );
      fireGestureHandler( getByGestureTestId( "PhotoCropper.handle.bottomRight" ), [
        { state: State.BEGAN },
        { state: State.ACTIVE, translationX: 0, translationY: 0 },
        { state: State.ACTIVE, translationX: -200, translationY: -150 },
        { state: State.END, translationX: -200, translationY: -150 },
      ] );
      await actor.press( screen.getByLabelText( "Save crop" ) );

      await waitFor( ( ) => {
        expect( originalImage.cropAsync ).toHaveBeenCalledWith( 0, 0, 1024, 768 );
      } );
      await waitFor( ( ) => {
        const { photo } = useStore.getState( ).currentObservation.observationPhotos[0];
        expect( photo.localFilePath ).not.toEqual( localFilePath );
      } );
    } );
  } );
} );
