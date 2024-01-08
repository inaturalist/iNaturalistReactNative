import { screen } from "@testing-library/react-native";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const initialStoreState = useStore.getState( );

const photos = [factory( "RemoteObservationPhoto" ), factory( "RemoteObservationPhoto" )];

const renderEvidenceList = evidencePhotos => renderComponent(
  <EvidenceList
    photos={evidencePhotos}
    savingPhoto
  />
);

describe( "EvidenceList", ( ) => {
  beforeAll( ( ) => {
    useStore.setState( initialStoreState, true );
  } );

  it( "should display add evidence button", ( ) => {
    renderEvidenceList( photos );

    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
  } );

  it( "should display loading wheel if photo is saving", ( ) => {
    useStore.setState( {
      savingPhoto: true
    } );
    renderEvidenceList( photos );

    expect( screen.getByTestId( "EvidenceList.saving" ) ).toBeVisible( );
  } );

  it( "should render all observation photos", ( ) => {
    renderEvidenceList( photos );

    expect( screen.getByTestId( `EvidenceList.${photos[0].photo.url}` ) ).toBeVisible( );
    expect( screen.getByTestId( `EvidenceList.${photos[1].photo.url}` ) ).toBeVisible( );
  } );

  it( "should display an empty list when observation has no observation photos", ( ) => {
    renderEvidenceList( [] );
    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
    expect( screen.queryByTestId( "ObsEdit.photo" ) ).toBeFalsy( );
  } );
} );
