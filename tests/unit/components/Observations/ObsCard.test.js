import { fireEvent, render } from "@testing-library/react-native";
import { t } from "i18next";
import React from "react";

import ObsCard from "../../../../src/components/SharedComponents/ObservationViews/ObsCard";
import factory from "../../../factory";

const testObservation = factory( "LocalObservation" );

const qualityGradeText = t( "RG" );

// this probably isn't the right approach, but it does allow the test to pass
jest.mock( "../../../../src/models/index", ( ) => {
  const originalModule = jest.requireActual( "../../../../src/models/index" );

  // Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    default: {
      inMemory: true
    }
  };
} );

test( "renders text passed into observation card", ( ) => {
  const { getByTestId, getByText } = render(
    <ObsCard
      item={testObservation}
    />
  );

  expect( getByTestId( `ObsList.obsCard.${testObservation.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "ObsList.photo" ).props.source )
    .toStrictEqual( { uri: testObservation.observationPhotos[0].photo.url } );
  expect( getByText( testObservation.taxon.preferredCommonName ) ).toBeTruthy( );
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy( );
  expect( getByText( testObservation.comments.length.toString( ) ) ).toBeTruthy( );
  expect( getByText( testObservation.identifications.length.toString( ) ) ).toBeTruthy( );
  expect( getByText( qualityGradeText ) ).toBeTruthy( );
} );

test( "navigates to ObsDetails on button press", ( ) => {
  const fakeNavigation = {
    navigate: jest.fn( )
  };

  const { getByTestId } = render(
    <ObsCard
      item={testObservation}
      handlePress={( ) => fakeNavigation.navigate( "ObsDetails" )}
    />
  );

  const button = getByTestId( `ObsList.obsCard.${testObservation.uuid}` );

  fireEvent.press( button );
  expect( fakeNavigation.navigate ).toBeCalledWith( "ObsDetails" );
} );

test( "should not have accessibility errors", ( ) => {
  const obsCard = <ObsCard item={testObservation} />;

  expect( obsCard ).toBeAccessible( );
} );
