import { useRoute } from "@react-navigation/native";
import { fireEvent, screen } from "@testing-library/react-native";
import DQAContainer from "components/ObsDetails/DQAContainer";
import React from "react";
import factory from "tests/factory";
import faker from "tests/helpers/faker";
import { renderComponent } from "tests/helpers/render";

const mockObservation = factory( "LocalObservation", {
  observed_on: "2023-12-14T21:07:41-09:30",
  observationPhotos: [factory( "LocalObservationPhoto" )],
  latitude: Number( faker.location.latitude( ) ),
  longitude: Number( faker.location.longitude( ) ),
  taxon: {
    id: undefined,
    rank_level: undefined
  },
  identifications: [],
  // casual is the default, so using needs_id here ensures test
  // is using our mock observation, not just showing the default screen
  quality_grade: "needs_id",
  votes: []
} );

const mockUserID = "some_user_id";

// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    id: mockUserID
  } ) )
} ) );

jest.mock( "sharedHooks/useAuthenticatedQuery", () => ( {
  __esModule: true,
  default: () => ( {
    data: []
  } )
} ) );

const mockMutate = jest.fn();
jest.mock( "sharedHooks/useAuthenticatedMutation", () => ( {
  __esModule: true,
  default: () => ( {
    mutate: mockMutate
  } )
} ) );

jest.mock( "sharedHooks/useLocalObservation", () => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    localObservation: mockObservation
  } ) )
} ) );

useRoute.mockImplementation( ( ) => ( {
  params: {
    observationUUID: mockObservation.uuid
  }
} ) );

async function expectMutateToHaveBeenCalled() {
  expect( await mockMutate ).toHaveBeenCalled();
  // Since we mocked the mutate() method, we're expecting mutation not to
  // succeed. We want to wait for this so there are no extra things happening
  // outside of act()
  screen.queryByText( "ERROR LOADING IN DQA" );
}

describe( "DQA Vote Buttons", ( ) => {
  beforeEach( ( ) => {
    jest.useFakeTimers( );
  } );
  test( "renders DQA vote buttons", async ( ) => {
    renderComponent( <DQAContainer /> );
    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyDisagree" );
    expect( emptyDisagreeButtons ).toBeTruthy( );
  } );

  test( "calls api when DQA disagree button is pressed", async ( ) => {
    renderComponent( <DQAContainer /> );
    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyDisagree" );
    fireEvent.press( emptyDisagreeButtons[0] );
    await expectMutateToHaveBeenCalled();
  } );

  test( "calls api when DQA agree button is pressed", async ( ) => {
    renderComponent( <DQAContainer /> );
    const emptyDisagreeButtons = await screen.findAllByTestId( "DQAVoteButton.EmptyAgree" );
    fireEvent.press( emptyDisagreeButtons[0] );
    await expectMutateToHaveBeenCalled();
  } );
} );
