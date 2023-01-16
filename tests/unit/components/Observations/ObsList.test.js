import { fireEvent, waitFor, within } from "@testing-library/react-native";
import ObsList from "components/Observations/ObsList";
import React from "react";

import factory from "../../../factory";
import { renderComponent } from "../../../helpers/render";

jest.useFakeTimers( );

const mockObservations = [
  factory( "LocalObservation", {
    comments: [
      factory( "LocalComment" ),
      factory( "LocalComment" ),
      factory( "LocalComment" )
    ]
  } ),
  factory( "LocalObservation" )
];

// Mock the hooks we use on ObsList since we're not trying to test them here

jest.mock( "sharedHooks/useApiToken" );

jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: ( ) => true
} ) );

jest.mock(
  "sharedHooks/useLocalObservations",
  ( ) => ( {
    __esModule: true,
    default: ( ) => ( {
      observationList: mockObservations,
      allObsToUpload: []
    } )
  } )
);

jest.mock( "@react-navigation/native", ( ) => {
  const actualNav = jest.requireActual( "@react-navigation/native" );
  return {
    ...actualNav,
    useRoute: ( ) => ( {
      params: {
        id: mockObservations[0].uuid
      }
    } )
  };
} );

it( "renders an observation", async ( ) => {
  await waitFor( ( ) => {
    const { getByTestId } = renderComponent( <ObsList /> );
    const obs = mockObservations[0];
    const list = getByTestId( "ObservationViews.myObservations" );

    // Test that there isn't other data lingering
    expect( list.props.data.length ).toEqual( mockObservations.length );
    // Test that a card got rendered for the our test obs
    const card = getByTestId( `ObsList.obsCard.${obs.uuid}` );
    expect( card ).toBeTruthy( );
    // Test that the card has the correct comment count
    const commentCount = within( card ).getByTestId( "ObsList.obsCard.commentCount" );
    expect( commentCount.children[0] ).toEqual( obs.comments.length.toString( ) );
  } );
} );

it( "renders multiple observations", async ( ) => {
  await waitFor( ( ) => {
    const { getByTestId } = renderComponent( <ObsList /> );
    mockObservations.forEach( obs => {
      expect( getByTestId( `ObsList.obsCard.${obs.uuid}` ) ).toBeTruthy( );
    } );
  } );
} );

it( "renders grid view on button press", async ( ) => {
  await waitFor( ( ) => {
    const { getByTestId } = renderComponent( <ObsList /> );
    const button = getByTestId( "ObsList.toggleGridView" );
    fireEvent.press( button );
    mockObservations.forEach( obs => {
      expect( getByTestId( `ObsList.gridItem.${obs.uuid}` ) ).toBeTruthy( );
    } );
  } );
} );

test.todo( "should not have accessibility errors" );
// test( "should not have accessibility errors", ( ) => {
//   const obsList = (
//     <NavigationContainer>
//        <ObsList />
//     </NavigationContainer>
//   );
//   expect( obsList ).toBeAccessible( );
// } );
