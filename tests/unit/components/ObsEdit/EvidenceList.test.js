import { screen } from "@testing-library/react-native";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";
import useStore from "stores/useStore";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

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
} );
