import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import factory from "../../../factory";
import ObsCard from "../../../../src/components/Observations/ObsCard";

const testObservation = factory( "LocalObservation" );

test( "renders text passed into observation card", ( ) => {
  const { getByTestId, getByText } = render(
    <ObsCard
      item={testObservation}
    />
  );

  expect( getByTestId( `ObsList.obsCard.${testObservation.uuid}` ) ).toBeTruthy( );
  expect( getByTestId( "ObsList.photo" ).props.source ).toStrictEqual( { "uri": testObservation.observationPhotos[0].photo.url } );
  expect( getByText( testObservation.taxon.preferredCommonName ) ).toBeTruthy( );
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy( );
  expect( getByText( testObservation.timeObservedAt ) ).toBeTruthy( );
  expect( getByText( testObservation.comments.length.toString( ) ) ).toBeTruthy( );
  expect( getByText( testObservation.identifications.length.toString( ) ) ).toBeTruthy( );
  expect( getByText( testObservation.qualityGrade ) ).toBeTruthy( );
} );

test( "navigates to ObsDetails on button press", ( ) => {
  const fakeNavigation = {
    navigate: jest.fn( )
  };

  const { getByTestId } = render(
    <ObsCard
      item={testObservation}
      handlePress={item => fakeNavigation.navigate( "ObsDetails" )}
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
