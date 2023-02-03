import {
  fireEvent, screen, within
} from "@testing-library/react-native";
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

const mockUser = factory( "LocalUser" );

jest.mock( "sharedHooks/useCurrentUser", () => ( {
  __esModule: true,
  default: () => mockUser
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
  renderComponent( <ObsList /> );
  const obs = mockObservations[0];

  const list = await screen.findByTestId( "ObservationViews.myObservations" );
  // Test that there isn't other data lingering
  expect( list.props.data.length ).toEqual( mockObservations.length );
  // Test that a card got rendered for the our test obs
  const card = await screen.findByTestId( `ObsList.obsCard.${obs.uuid}` );
  expect( card ).toBeTruthy( );
  // Test that the card has the correct comment count
  const commentCount = within( card ).getByTestId( "ActivityCount.commentCount" );
  // TODO: I disabled node eslint rule here because we will soon have to refactor this
  // test into it's own unit test, because the comment count will be a component
  // after the refactor we should change this line to be in compliance with the eslint rule
  // eslint-disable-next-line testing-library/no-node-access
  expect( commentCount.children[0] ).toEqual( obs.comments.length.toString( ) );
} );

it( "renders multiple observations", async ( ) => {
  renderComponent( <ObsList /> );
  // Awaiting the first observation because using await in the forEach errors out
  const firstObs = mockObservations[0];
  await screen.findByTestId( `ObsList.obsCard.${firstObs.uuid}` );
  mockObservations.forEach( obs => {
    expect( screen.getByTestId( `ObsList.obsCard.${obs.uuid}` ) ).toBeTruthy();
  } );
  // TODO: some things are still happening in the background so I unmount here,
  // better probably to mock away those things happening in the background for this test
  screen.unmount();
} );

it( "renders grid view on button press", async ( ) => {
  renderComponent( <ObsList /> );
  const button = await screen.findByTestId( "ObsList.toggleGridView" );
  fireEvent.press( button );
  // Awaiting the first observation because using await in the forEach errors out
  const firstObs = mockObservations[0];
  await screen.findByTestId( `ObsList.gridItem.${firstObs.uuid}` );
  mockObservations.forEach( obs => {
    expect( screen.getByTestId( `ObsList.gridItem.${obs.uuid}` ) ).toBeTruthy( );
  } );
} );

describe( "ObsList", () => {
  test( "should not have accessibility errors", () => {
    renderComponent( <ObsList /> );
    const obsList = screen.getByTestId( "ObservationViews.myObservations" );
    expect( obsList ).toBeAccessible( );
  } );
} );
