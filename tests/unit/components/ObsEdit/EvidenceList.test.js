import { screen, userEvent, waitFor } from "@testing-library/react-native";
import { photoUploadPath } from "appConstants/paths";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";
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

  describe( "rotating a photo that has not been uploaded", ( ) => {
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
  } );
} );
