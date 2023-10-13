import { faker } from "@faker-js/faker";
import { screen } from "@testing-library/react-native";
import EvidenceList from "components/ObsEdit/EvidenceList";
import { ObsEditContext } from "providers/contexts";
import INatPaperProvider from "providers/INatPaperProvider";
import ObsEditProvider from "providers/ObsEditProvider";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

const observationPhotos = [
  factory( "RemoteObservationPhoto", {
    photo: {
      url: faker.image.imageUrl( )
    },
    position: 0
  } ),
  factory( "RemoteObservationPhoto", {
    photo: {
      url: `${faker.image.imageUrl( )}/100`
    },
    position: 1
  } )
];

jest.mock( "providers/ObsEditProvider" );
const mockObsEditProvider = ( savingPhoto = false ) => ObsEditProvider
  .mockImplementation( ( { children } ) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values
    <INatPaperProvider>
      <ObsEditContext.Provider value={{
        savingPhoto
      }}
      >
        {children}
      </ObsEditContext.Provider>
    </INatPaperProvider>
  ) );

const renderEvidenceList = evidenceList => renderComponent(
  <ObsEditProvider>
    <EvidenceList evidenceList={evidenceList} />
  </ObsEditProvider>
);

describe( "EvidenceList", ( ) => {
  it( "should display add evidence button", ( ) => {
    mockObsEditProvider( );
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
  } );

  it( "should display loading wheel if photo is saving", ( ) => {
    mockObsEditProvider( true );
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( "EvidenceList.saving" ) ).toBeVisible( );
  } );

  it( "should render all observation photos", ( ) => {
    mockObsEditProvider( );
    renderEvidenceList( observationPhotos );

    expect( screen.getByTestId( `EvidenceList.${observationPhotos[0].photo.url}` ) ).toBeVisible( );
    expect( screen.getByTestId( `EvidenceList.${observationPhotos[1].photo.url}` ) ).toBeVisible( );
  } );

  it( "should display an empty list when observation has no observation photos", ( ) => {
    mockObsEditProvider( );
    renderEvidenceList( [] );
    expect( screen.getByTestId( "EvidenceList.add" ) ).toBeVisible( );
    expect( screen.queryByTestId( "ObsEdit.photo" ) ).toBeFalsy( );
  } );
} );
