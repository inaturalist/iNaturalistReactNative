import React from "react";
import { render, within } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import factory from "../../../factory";
import ObsList from "../../../../src/components/Observations/ObsList";
import ObservationProvider from "../../../../src/providers/ObservationProvider";
import { ObservationContext } from "../../../../src/providers/contexts";

// Mock the hooks we use on ObsList since we're not trying to test them here
jest.mock( "../../../../src/components/Observations/hooks/fetchObservations" );

jest.mock( "../../../../src/providers/ObservationProvider" );

// Mock ObservationProvider so it provides a specific array of observations
// without any current observation or ability to update or fetch
// observations
const mockObservationProviderWithObservations = observations =>
  ObservationProvider.mockImplementation( ( { children }: Props ): Node => (
    <ObservationContext.Provider value={{
      observationList: observations,
      observationId: null,
      updateObservationId: ( ) => {},
      fetchObservations: ( ) => {}
    }}>
      {children}
    </ObservationContext.Provider>
  ) );

const renderObsList = ( ) => render(
  <NavigationContainer>
    <ObservationProvider>
      <ObsList />
    </ObservationProvider>
  </NavigationContainer>
);

it( "renders an observation", ( ) => {
  // const observations = [factory( "LocalObservation", { commentCount: 11 } )];
  const observations = [factory( "LocalObservation", { commentCount: 11 } )];
  // Mock the provided observations so we're just using our test data
  mockObservationProviderWithObservations( observations );
  const { getByTestId } = renderObsList( );
  const obs = observations[0];
  const list = getByTestId( "ObsList.myObservations" );
  // Test that there isn't other data lingering
  expect( list.props.data.length ).toEqual( observations.length );
  // Test that a card got rendered for the our test obs
  const card = getByTestId( `ObsList.obsCard.${obs.uuid}` );
  expect( card ).toBeTruthy( );
  // Test that the card has the correct comment count
  const commentCount = within( card ).getByTestId( "ObsList.obsCard.commentCount" );
  expect( commentCount.children[0] ).toEqual( obs.commentCount.toString( ) );
} );

it( "renders multiple observations", async ( ) => {
  const observations = [
    factory( "LocalObservation" ),
    factory( "LocalObservation" )
  ];
  mockObservationProviderWithObservations( observations );
  const { getByTestId } = renderObsList( );
  observations.forEach( obs => {
    expect( getByTestId( `ObsList.obsCard.${obs.uuid}` ) ).toBeTruthy( );
  } );
} );
