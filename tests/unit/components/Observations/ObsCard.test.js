import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import AccessibilityEngine from "react-native-accessibility-engine";
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
  expect( getByTestId( "ObsList.photo" ).props.source ).toStrictEqual( { "uri": testObservation.userPhoto } );
  expect( getByText( testObservation.commonName ) ).toBeTruthy( );
  expect( getByText( testObservation.placeGuess ) ).toBeTruthy( );
  expect( getByText( testObservation.timeObservedAt ) ).toBeTruthy( );
  expect( getByText( testObservation.commentCount.toString( ) ) ).toBeTruthy( );
  expect( getByText( testObservation.identificationCount.toString( ) ) ).toBeTruthy( );
  expect( getByText( testObservation.qualityGrade ) ).toBeTruthy( );
} );

test( "handles button press", ( ) => {
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
  expect( ( ) => AccessibilityEngine.check( obsCard ) ).not.toThrow();
} );
