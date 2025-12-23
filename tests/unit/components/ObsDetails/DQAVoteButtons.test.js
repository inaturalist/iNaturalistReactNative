import { screen } from "@testing-library/react-native";
import DQAVoteButtons from "components/ObsDetails/DetailsTab/DQAVoteButtons";
import React from "react";
import factory from "tests/factory";
import { renderComponent } from "tests/helpers/render";

const mockUser = factory( "RemoteUser" );
const mockQualityMetrics = [
  {
    id: 0,
    agree: true,
    metric: "wild",
    user_id: mockUser.id,
  },
];

const mockVotesNeedsID = [
  factory( "RemoteVote", {
    vote_scope: "needs_id",
    user: mockUser,
    user_id: mockUser.id,
  } ),
];

// Mock useCurrentUser hook
jest.mock( "sharedHooks/useCurrentUser", ( ) => ( {
  __esModule: true,
  default: jest.fn( ( ) => ( {
    id: mockUser.id,
  } ) ),
} ) );

describe( "DQA Vote Buttons for wild metric", ( ) => {
  test( "renders correct DQA user vote", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="wild"
      votes={mockQualityMetrics}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const button = await screen.findByTestId(
      "DQAVoteButton.UserAgree",
    );
    expect( button ).toBeTruthy( );
  } );

  test( "renders correct DQA user vote number", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="wild"
      votes={mockQualityMetrics}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const voteNumber = await screen.findByText(
      "1",
    );
    expect( voteNumber ).toBeTruthy( );
  } );
} );

describe( "DQA Vote Buttons for needs_id metric", ( ) => {
  test( "renders correct DQA user vote", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="needs_id"
      votes={mockVotesNeedsID}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const button = await screen.findByTestId(
      "DQAVoteButton.UserAgree",
    );
    expect( button ).toBeTruthy( );
  } );

  test( "renders correct DQA user vote number", async ( ) => {
    renderComponent( <DQAVoteButtons
      metric="needs_id"
      votes={mockVotesNeedsID}
      setVote={jest.fn()}
      loadingAgree={jest.fn()}
      loadingDisagree={jest.fn()}
      loadingMetric={jest.fn()}
      removeVote={jest.fn()}
    /> );

    const voteNumber = await screen.findByText(
      "1",
    );
    expect( voteNumber ).toBeTruthy( );
  } );
} );
