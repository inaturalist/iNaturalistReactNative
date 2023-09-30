import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import EvidenceList from "components/ObsEdit/EvidenceList";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const observationPhotos = [
  factory( "RemoteObservation", {
    observationPhotos: [
      factory( "LocalObservationPhoto", {
        photo: {
          url: faker.image.imageUrl( )
        },
        position: 0
      } ),
      factory( "LocalObservationPhoto", {
        photo: {
          url: faker.image.imageUrl( )
        },
        position: 1
      } )
    ]
  } )
];

describe( "EvidenceList", ( ) => {
  it( "should display add evidence button", ( ) => {
    renderComponent(
      <EvidenceList
        evidenceList={observationPhotos}
      />
    );

    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
  } );

  it( "should display loading wheel if photo is saving", ( ) => {
    renderComponent(
      <EvidenceList
        evidenceList={observationPhotos}
        savingPhoto
      />
    );

    expect( screen.getByTestId( "EvidenceList.saving" ) ).toBeVisible( );
  } );
} );
