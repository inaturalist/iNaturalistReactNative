import React from "react";
import { waitFor, render, within } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import factory from "../../../factory";
import ObsList from "../../../../src/components/Observations/ObsList";
import useFetchObsListFromRealm from "../../../../src/components/Observations/hooks/fetchObsListFromRealm";

// Mock the hooks we use on ObsList since we're not trying to test them here
jest.mock( "../../../../src/components/Observations/hooks/fetchObservations" );
jest.mock( "../../../../src/components/Observations/hooks/fetchObsListFromRealm" );

it( "renders an observation", async ( ) => {
  const observations = [factory( "LocalObservation", { commentCount: 11 } )];
  // Mock the return value of this hook so we're just using our test data
  useFetchObsListFromRealm.mockReturnValue( observations );
  const { getByTestId } = await waitFor(
    ( ) => render( <NavigationContainer><ObsList /></NavigationContainer> )
  );
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
