import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const observationPhotos = [
  factory( "RemoteObservationPhoto", {
    photo: {
      url: faker.image.url( )
    },
    position: 0
  } ),
  factory( "RemoteObservationPhoto", {
    photo: {
      url: `${faker.image.url( )}/100`
    },
    position: 1
  } )
];

const renderEvidenceList = evidenceList => renderComponent(
  <EvidenceList
    evidenceList={evidenceList}
    savingPhoto
  />
);

describe( "EvidenceList", ( ) => {
  it( "should display add evidence button", ( ) => {
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
  } );

  it( "should display loading wheel if photo is saving", ( ) => {
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( "EvidenceList.saving" ) ).toBeVisible( );
  } );

  it( "should render all observation photos", ( ) => {
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( `EvidenceList.${observationPhotos[0].photo.url}` ) ).toBeVisible( );
    expect( screen.getByTestId( `EvidenceList.${observationPhotos[1].photo.url}` ) ).toBeVisible( );
  } );

  it( "should display an empty list when observation has no observation photos", ( ) => {
    renderEvidenceList( [] );
    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
    expect( screen.queryByTestId( "ObsEdit.photo" ) ).toBeFalsy( );
  } );
} );
